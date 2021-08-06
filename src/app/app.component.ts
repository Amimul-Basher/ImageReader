import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { createWorker } from 'tesseract.js';

import { delay } from 'rxjs/operators';
import * as Tesseract from 'tesseract.js';



    
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

// Source: https://www.remotestack.io/angular-image-upload-and-preview-tutorial-example/

export class AppComponent implements OnInit{
  worker?: Tesseract.Worker;
  imgFile?: string;
  title = 'ImageReader';

  img : any;
  w:any;
  h:any;
  canvas: any;
  ctx: any;
  // data: any;
  
  
  // This path used in recognize function as static input
  // image = "assets/textImage.png"

   uploadForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    file: new FormControl('', [Validators.required]),
    imgSrc: new FormControl('', [Validators.required])
  });
  ocrResult?: string;

  username?: string;
  userid?: string;
  userbirthdate?: string;

  
  constructor() {}

  // Load the worker as soon as the program starts
  ngOnInit(){
    this.loadWorker();
  }


  // Creating worker to recognize the image
  async loadWorker(){
    this.worker = createWorker({
      logger: progress => {
        console.log(progress);
      }
    });
    await this.worker.load();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
    console.log('FINISH');

  }

  async recognizeImage(){
    this.imageProcessing();
    //const result = await this.worker?.recognize(this.uploadForm.value.imgSrc);
    
    const result = await this.worker?.recognize(this.img.src);
    console.log(result);
    this.ocrResult = result?.data.text;
    //await this.worker?.terminate();
    this.findInformation(this.ocrResult);
  }


  imageProcessing(){
    
    this.img = new Image();
    this.img.src = this.uploadForm.value.imgSrc;
    console.log(this.img);
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.drawImage(this.img, 0, 0);
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var count = (data[i] + data[i + 1] + data[i + 2]) ;
        let avg = 0;
        if (count > 450 ) avg = 255;
        // else if(count > 255) avg = 127.5
        // else avg = 255;

        data[i]     = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }
    this.ctx.putImageData(imageData, 0, 0);
    this.img.src = this.canvas.toDataURL('image/jpg', 1);
    
  }

    
  get uf(){
    return this.uploadForm.controls;
  }
   
  onImageChange(e: any) {
    const reader = new FileReader();
    this.img = new Image();
    
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      
      reader.readAsDataURL(file);
    
      reader.onload = () => {
        this.imgFile = reader.result as string;
        this.uploadForm.patchValue({
          imgSrc: reader.result
        });   
      };
      
    }
  }
  //revoked when the upload button is called
  async upload(){
    this.recognizeImage();
  }
  
  //To find the exact birth date, Name and ID no
  findInformation(result?: string){
    console.log("nothing is executing here");
    console.log(result);
    if(result?.match("NATIONALIDCARD") || result?.match("ID CARD")){
      for(let i = 0; i < result.length ; i++){
        console.log(result[i] + " ");
      }
      // Name
      var low = result.indexOf("Name:") + 6;
      let i = low;
      while( (result[i]>='a' && result[i]<='z') || (result[i]>='A' && result[i]<='Z') || result[i] == ' ' || result[i] == '.'  ){
        i++;
      }
      var high = i-1;
      this.username= result.substring(low, high);
      console.log("Name: "+this.username + "end");

      // DateOfBirth

      low = result.indexOf("DateofBirth:") + 13;
      high = low + 11;
      this.userbirthdate = result.substring(low, high);
      console.log("Date of Birth: "+this.userbirthdate + "end");

      //ID

      low = result.indexOf("ID NO:") + 6;
      i = low;
      while( (result[i]>='0' && result[i]<='9' ) || result[i] == " " ){
        i++;
      }
      high = i;
      this.userid = result.substring(low, high);
      console.log("ID: "+this.userid + "end");

    }else{
      console.log("-1");
    }
  }

}