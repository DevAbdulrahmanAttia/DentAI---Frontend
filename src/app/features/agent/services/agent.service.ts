import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { API_URL } from '@core/tokens/api-url.token';
import { AgentHistoryMessage, AgentReply, AgentTool } from '@core/models/agent.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL, { optional: true }) || environment.apiUrl;

  sendMessage(message: string, history: AgentHistoryMessage[] = []): Observable<AgentReply> {
    const url = `${this.apiUrl}${API_ENDPOINTS.AGENT}/message`;
    return this.http.post<AgentReply>(url, { message, history });
  }

  executeAction(tool: AgentTool, args: Record<string, unknown>): Observable<unknown> {
    const url = `${this.apiUrl}${API_ENDPOINTS.AGENT}/execute`;
    return this.http.post<unknown>(url, { tool, arguments: args });
  }
}
