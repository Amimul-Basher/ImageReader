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
    const result = await this.worker?.recognize(this.uploadForm.value.imgSrc);
    console.log(result);
    this.ocrResult = result?.data.text;
    //await this.worker?.terminate();
    this.findInformation(this.ocrResult);
  }

    
  get uf(){
    return this.uploadForm.controls;
  }
   
  onImageChange(e: any) {
    const reader = new FileReader();
    
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      ////
      console.log(file);
      reader.readAsDataURL(file);
      ////
    
      reader.onload = () => {
        this.imgFile = reader.result as string;
        this.uploadForm.patchValue({
          imgSrc: reader.result
        });
   
      };
    }
  }
   
  async upload(){

    



    this.recognizeImage();
    // ////
    // console.log(this.uploadForm.value.imgSrc);
    // ////
    // console.log(this.ocrResult)
  }
  

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