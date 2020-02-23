import {VideoPlayerService} from './video-player.service';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, filter, map, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Utterance} from './utterance';
import {CombinedUtterances} from './combined-utterances';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent {

  constructor(private route: ActivatedRoute, private videoPlayerService: VideoPlayerService) {
    this.id = this.route.queryParams.pipe(
      filter(params => params.id),
      map(params => params.id));
    this.src = this.id.pipe(map(id => videoPlayerService.getVideoSrc(id)));
    this.utterances = this.id.pipe(
      switchMap(id => videoPlayerService.getTranscript(id)),
      map(utterances => utterances.sort((a, b) => a.time - b.time)),
      map(utterances => this.combineUtterances(utterances)),
      catchError(err => {
        this.getTranscriptError = err.message;
        throw err;
      }));
  }
  @ViewChild('videoPlayer', {static: false})
  private videoPlayer: ElementRef<HTMLVideoElement>;

  private id: Observable<string>;
  src: Observable<string>;
  utterances: Observable<CombinedUtterances[]>;

  isVideoPlaying = false;
  private getTranscriptError: string;

  speakersClasses = {
    Cust: 'cust',
    Rep: 'rep'
  };

  combineUtterances(utterances: Utterance[]) {
    return utterances.reduce((combined, utterance) => {
      const last = combined[combined.length - 1];
      const snippet = utterance.snippet;
      if (!last || last.speaker !== utterance.speaker) {
        combined.push({speaker: utterance.speaker, snippets: [snippet]});
      } else {
        last.snippets.push(snippet);
      }
      return combined;

    }, [] as CombinedUtterances[]);
  }

  utteranceClass(utterance: CombinedUtterances) {
    return this.speakersClasses[utterance.speaker] || '';
  }

  playVideo() {
    this.videoPlayer.nativeElement.play().then(() => this.isVideoPlaying = true);
  }
}

