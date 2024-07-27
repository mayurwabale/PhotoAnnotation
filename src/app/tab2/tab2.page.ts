import {  Component, ElementRef, viewChild } from '@angular/core';
import { PhotoCaptureService } from '../service/photo-capture.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  recentPhoto: any;
  canvas!: HTMLCanvasElement
  constructor(public photoService: PhotoCaptureService) { }
  imageToAnnotate = viewChild.required<ElementRef>('canvas');
  isDrawing = false;
  coordinatesObj = {};
  image = viewChild.required<ElementRef>('imageCap');
  showOriginalImage = true;
  showAnnotation = false;
  shapeType: string = '';

  //below method is used to capture photo
  savePhotoToGallery() {
    this.photoService.savePhotoToGallery();
    this.photoService.capturedPhotoObs.subscribe(res => {
      this.recentPhoto = res;
      this.showAnnotation = true;
      this.showOriginalImage = true;

    })
  }
  //below method is used to show photo in canvas to annotate it
  showImage() {
    this.showOriginalImage = false;
    const canvas: HTMLCanvasElement = this.imageToAnnotate().nativeElement;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = this.recentPhoto.webPath
    this.drawImageScaled(img, context, canvas)
  }
  //below method is used to scale image to fit in the HTML canvas
  drawImageScaled(img: HTMLImageElement, ctx: CanvasRenderingContext2D | null, canvas: HTMLCanvasElement) {
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = 10
    const centerShiftY = (canvas.height - img.height * ratio) / 2;
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, centerShiftY, img.width * 0.47, img.height * ratio);
      this.showOriginalImage = false;
    }
  }

  //below method is used to download annotated image
  downloadImage() {
    const canvas: HTMLCanvasElement = this.imageToAnnotate().nativeElement;
    const canvasDownload: HTMLAnchorElement = document.getElementById('canvasDownload') as HTMLAnchorElement;
    const pngDataUrl = canvas.toDataURL("image/png");
    if (canvasDownload) {
      canvasDownload.href = pngDataUrl;
      canvasDownload.download = this.getCurrentDate();
    }
  }

  //below method is used to draw rectangle shape on image
  drawRectangle() {
    this.canvas = this.imageToAnnotate().nativeElement;
    const context = this.canvas.getContext('2d');
    let startX: number, startY: number, width: number, height: number;
    this.drawPolyline(true);
    this.canvas.addEventListener("pointerdown", (event) => {
      this.isDrawing = true;
      startX = event.clientX;
      startY = event.clientY - this.canvas.getBoundingClientRect().top;
    });

    this.canvas.addEventListener('touchmove', (event) => {
      event.preventDefault();
      if (!this.isDrawing) return;
      let touch = event.touches[0] || event.changedTouches[0];
      let touchX = touch.pageX;
      let touchY = touch.pageY - this.canvas.getBoundingClientRect().top;
      width = touchX - startX;
      height = touchY - startY;
    });

    this.canvas.addEventListener('pointerup', (event) => {
      this.isDrawing = false;
      if (context) {
        context.strokeRect(startX, startY, width, height);
        this.photoService.coordinatesObj.rectangle.push({ x: startX, y: startY, width, height });
      }
    });


  }
  //below method is used to download annotated coordinates
  downloadCoordinate() {
    const Json = JSON.stringify(this.photoService.coordinatesObj);
    const blob = new Blob([Json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const coordinateDownload: HTMLAnchorElement = document.getElementById('coordinateDownload') as HTMLAnchorElement;
    coordinateDownload.href = url;
    coordinateDownload.download = this.getCurrentDate();
  }
  //below method is used to draw polygon shape on image
  drawPolygon() {


    const canvas: HTMLCanvasElement = this.imageToAnnotate().nativeElement;
    const context = canvas.getContext('2d')!;

    console.log('polygon');
    let isDrawing = false;
    let points: { x: number, y: number }[] = [];
    canvas.addEventListener('pointerdown', (e) => {
      console.log('pointerdown');
      console.log(`x:${e.offsetX}, y:${e.offsetY}`);
      isDrawing = true;
      points.push({ x: e.offsetX, y: e.offsetY });
      context.beginPath();
      context.moveTo(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('touchmove', (e) => {
      console.log('touchmove', isDrawing);
      e.preventDefault();
      if (!isDrawing) return;
      let touch = e.touches[0] || e.changedTouches[0];
      let touchX = touch.pageX;
      let touchY = touch.pageY
      context.lineTo(touchX, touchY);
      context.stroke();
      points.push({ x: touchX, y: touchY });
    });
    canvas.addEventListener('pointerup', (e) => {
      console.log('mouseup', isDrawing)
      if (isDrawing) {
        context.closePath();
        isDrawing = false;
      }
      // Optionally, fill the polygon with color
      // context.fillStyle = 'rgba(255, 0, 0, 0.5)';
      // context.fill();
      // console.log(points);
      // Reset points array for a new polygon
      points = [];
    });



  }
  //below method is used to draw polyline shape on image
  drawPolyline(val?: boolean) {
    this.canvas = this.imageToAnnotate().nativeElement;
    const context = this.canvas.getContext('2d')!;
    const polylinePointerdown = (e: PointerEvent) => {
      x = e.clientX - this.canvas.getBoundingClientRect().left;
      y = e.clientY - this.canvas.getBoundingClientRect().top;
      isDrawing = true;
    }
    const polylineTouchmove = (e: TouchEvent) => {
      e.preventDefault();
      if (isDrawing === true) {
        let touch = e.touches[0] || e.changedTouches[0];
        let touchX = touch.pageX;
        let touchY = touch.pageY;
        // context.beginPath();
        // context.strokeStyle = 'black';
        // context.lineWidth = 1;
        // context.moveTo(x, y);
        // context.lineTo(touchX, touchY);
        // console.log('touchmove', x, y, touchX, touchY);
        // context.stroke();
        // context.closePath();
        // x = touchX;
        //  y = touchY;
      }
    }
    const polylinePointerup = (e: PointerEvent) => {
      if (isDrawing === true) {
        context.beginPath();
        context.strokeStyle = 'black';
        context.lineWidth = 1;
        context.moveTo(x, y);
        context.lineTo(e.offsetX, e.offsetY);
        context.stroke();
        context.closePath();
        this.photoService.coordinatesObj.polyline.push({ startx: x, starty: y, endx: e.offsetX, endy: e.offsetY })
        x = 0;
        y = 0;
        isDrawing = false;
      }
    }
    if (val) {
      this.canvas.removeEventListener('pointerdown', polylinePointerdown);
      this.canvas.removeEventListener('touchmove', polylineTouchmove);
      this.canvas.removeEventListener('pointerup', polylinePointerup);
      return;
    }
    let isDrawing = false;
    let x = 0;
    let y = 0;
    this.canvas.addEventListener('pointerdown', polylinePointerdown);
    this.canvas.addEventListener('touchmove', polylineTouchmove);
    this.canvas.addEventListener('pointerup', polylinePointerup);
  }
  //below method is used to get current date to rename downloaded file
  getCurrentDate() {
    let date = new Date();
    let currentDate = date.getUTCDate();
    let currentMonth = date.toLocaleString('default', { month: 'short' });
    let currentYear = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let miliSeconds = date.getMilliseconds();
    let currentDateStr = currentDate + currentMonth + currentYear + '_' + hours + minutes + miliSeconds;
    return currentDateStr
  }
  //below method is used to create context in canvas
  getCanvasContext(canvas: HTMLCanvasElement) {
    return canvas.getContext('2d');
  }

}
