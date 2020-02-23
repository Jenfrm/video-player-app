import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utterance} from './utterance';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  constructor(private http: HttpClient) {
  }

  getVideoSrc(id: string) {
    return `https://static.chorus.ai/api/${id}.mp4`;
  }

  getTranscript(id: string) {
    return this.http.get<Utterance[]>(`assets/${id}.json`);
  }
}
