import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';

export interface DirectionStep {
  distance: number;
  duration: number;
  instruction: string;
  name: string;
  type: string;
  waypoints: number[];
}

export interface DirectionSegment {
  distance: number;
  duration: number;
  steps: DirectionStep[];
}

export interface DirectionsResponse {
  segments: DirectionSegment[];
  summary: {
    distance: number;
    duration: number;
  };
  waypoints: {
    location: number[];
    name: string;
  }[];
}

@Injectable()
export class DirectionsService {
  private apiKey: string;
  private baseUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';
  private readonly logger = new Logger(DirectionsService.name);
  private requestsInLastMinute = 0;
  private lastMinuteTimestamp = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 38; // Limit to 38 requests per minute (40 is the limit for free tier)
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Retrieve API key from environment configuration
    this.apiKey = this.configService.get<string>('OPENROUTE_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('OpenRouteService API key not provided. Direction features will be limited.');
    }
  }

  /**
   * Check if we can make another API request without hitting rate limits
   */
  private async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    // Reset counter if a minute has passed
    if (now - this.lastMinuteTimestamp > 60000) {
      this.requestsInLastMinute = 0;
      this.lastMinuteTimestamp = now;
    }
    
    if (this.requestsInLastMinute >= this.MAX_REQUESTS_PER_MINUTE) {
      this.logger.warn('API rate limit reached, delaying request');
      // Wait until the minute is up
      await new Promise(resolve => setTimeout(resolve, 
        60000 - (now - this.lastMinuteTimestamp) + 1000)); // Add 1 second buffer
      this.requestsInLastMinute = 0;
      this.lastMinuteTimestamp = Date.now();
    }
    
    this.requestsInLastMinute++;
    return true;
  }

  /**
   * Get directions between two points
   * @param startLat Starting latitude
   * @param startLng Starting longitude
   * @param endLat Ending latitude
   * @param endLng Ending longitude
   * @returns Directions response with turn-by-turn instructions
   */
  async getDirections(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ): Promise<DirectionsResponse | null> {
    if (!this.apiKey) {
      this.logger.warn('No API key provided for OpenRouteService');
      return null;
    }

    try {
      await this.checkRateLimit();
      
      // OpenRouteService requires coordinates in [longitude, latitude] format
      const coordinates = [[startLng, startLat], [endLng, endLat]];
      
      // Use POST request with JSON body
      const url = `${this.baseUrl}/json`;
      
      const response = await firstValueFrom<AxiosResponse<DirectionsResponse>>(
        this.httpService.post(
          url,
          { coordinates },
          {
            headers: {
              'Authorization': this.apiKey,
              'Content-Type': 'application/json',
              'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            },
            timeout: 10000, // 10 second timeout
          }
        )
      );
      
      if (!response.data || !response.data.summary) {
        this.logger.warn('Invalid response from directions API');
        return null;
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        this.logger.error(`Error fetching directions: ${axiosError.response.status} - ${axiosError.message}`);
        
        // Check if we hit rate limits (429 Too Many Requests)
        if (axiosError.response.status === 429) {
          this.logger.warn('Rate limit hit, waiting 60 seconds before retrying');
          await new Promise(resolve => setTimeout(resolve, 61000)); // Wait 61 seconds
          
          // Try one more time
          try {
            await this.checkRateLimit();
            
            const coordinates = [[startLng, startLat], [endLng, endLat]];
            const url = `${this.baseUrl}/json`;
            
            const response = await firstValueFrom<AxiosResponse<DirectionsResponse>>(
              this.httpService.post(
                url,
                { coordinates },
                {
                  headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                  },
                  timeout: 10000,
                }
              )
            );
            return response.data;
          } catch (retryError) {
            this.logger.error(`Failed on retry: ${retryError.message}`);
            return null;
          }
        }
      } else {
        this.logger.error(`Error fetching directions: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Get directions for multiple waypoints in sequence
   * @param waypoints Array of [lat, lng] pairs
   * @returns Directions response with turn-by-turn instructions
   */
  async getDirectionsForWaypoints(
    waypoints: [number, number][],
  ): Promise<DirectionsResponse | null> {
    if (!this.apiKey || waypoints.length < 2) {
      return null;
    }

    try {
      await this.checkRateLimit();
      
      // OpenRouteService requires coordinates in [longitude, latitude] format
      const coordinates = waypoints.map(([lat, lng]) => [lng, lat]);
      
      const url = `${this.baseUrl}/json`;
      
      const response = await firstValueFrom<AxiosResponse<DirectionsResponse>>(
        this.httpService.post(
          url,
          { coordinates },
          {
            headers: {
              'Authorization': this.apiKey,
              'Content-Type': 'application/json',
              'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            },
            timeout: 10000, // 10 second timeout
          }
        )
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching directions for waypoints: ${error.message}`);
      return null;
    }
  }
} 