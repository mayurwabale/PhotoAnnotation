import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotoCaptureService {
  public photos: UserPhoto[] = [];
  capturedPhotoObs = new Subject<object>();
  coordinatesObj: { rectangle: RectangleCoordinates[], polyline:Polyline[]} = { rectangle: [], polyline:[]}
  constructor() { }

  //use to take photo from camera
  public async savePhotoToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      allowEditing: true,
      quality: 100
    });

    this.capturedPhotoObs.next(capturedPhoto)
    this.photos[0] = {
      filepath: "soon...",
      webviewPath: capturedPhoto.webPath!
    };
  }
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

export interface RectangleCoordinates {
  x: number,
  y: number,
  width: number,
  height: number
}

export interface Polyline {
  startx: number,
  starty: number,
  endx: number,
  endy: number
}
