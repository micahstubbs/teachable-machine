// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

class OutputSection {
  constructor(element) {
    this.element = element;

    const outputs = {
      GIFOutput: new GIFOutput(),
      SoundOutput: new SoundOutput(),
      SpeechOutput: new SpeechOutput()
    };

    this.classNames = GLOBALS.classNames;
    GLOBALS.predicting = true;

    this.outputs = outputs;
    this.loadedOutputs = [];

    let outputLinks = element.querySelectorAll('.output_selector__option');
    outputLinks.forEach(link => {
      link.addEventListener('click', this.changeOutput.bind(this));
    });
    this.currentLink = element.querySelector(
      '.output_selector__option--selected'
    );

    const uploadLinkElement = document.querySelector('#UploadTrainingData');
    uploadLinkElement.addEventListener('click', this.uploadOnClick.bind(this));

    const filePickerElement = document.querySelector('#file-input');
    filePickerElement.onchange = this.filePickerOnChange.bind(this);

    const downloadLinkElement = document.querySelector('#DownloadTrainingData');
    downloadLinkElement.addEventListener(
      'click',
      this.downloadOnClick.bind(this)
    );

    this.outputContainer = document.querySelector('#output-player');
    this.currentOutput = null;
    this.currentLink.click();

    this.arrow = new HighlightArrow(1);

    TweenMax.set(this.arrow.element, {
      rotation: -50,
      scale: -0.8,
      x: 140,
      y: -100
    });
    this.element.appendChild(this.arrow.element);
  }

  uploadOnClick() {
    document.getElementById('file-input').click();
  }

  filePickerOnChange() {
    var files = document.getElementById('file-input').files;
    console.log('files', files);
    if (files.length <= 0) {
      return false;
    }

    var fr = new FileReader();

    fr.onload = function(e) {
      console.log(e);
      var result = JSON.parse(e.target.result);
      console.log('json uploaded', result);
      // window.importedTrainingData = result;
      const event = new CustomEvent('trainingdataimported', { detail: result });
      window.dispatchEvent(event);
    };

    fr.readAsText(files.item(0));
  }

  downloadOnClick() {
    console.log('training data', window.trainingData);
    // const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
    //   JSON.stringify(window.trainingData)
    // )}`;
    const jsonData = JSON.stringify(window.trainingData);
    const dataBlob = new Blob([jsonData], { type: 'octect/stream' });
    const url = window.URL.createObjectURL(dataBlob);

    console.log('dataBlob', dataBlob);
    const downloadAnchorElement = document.getElementById('downloadAnchorElem');
    downloadAnchorElement.setAttribute('href', url);
    downloadAnchorElement.setAttribute('download', 'training-data.json');
    downloadAnchorElement.click();
    window.URL.revokeObjectURL(url);
  }

  enable() {
    this.element.classList.remove('section--disabled');
  }

  highlight() {
    this.arrow.show();
    TweenMax.from(this.arrow.element, 0.3, { opacity: 0 });
  }

  dehighlight() {
    TweenMax.killTweensOf(this.arrow.element);
    this.arrow.hide();
  }

  disable() {
    this.element.classList.add('section--disabled');
  }

  dim() {
    this.element.classList.add('dimmed');
  }

  undim() {
    this.element.classList.remove('dimmed');
  }

  changeOutput(event) {
    if (this.currentLink) {
      this.currentLink.classList.remove('output_selector__option--selected');
    }

    this.currentLink = event.target;
    this.currentLink.classList.add('output_selector__option--selected');
    let outputId = this.currentLink.id;

    if (this.currentOutput) {
      this.currentOutput.stop();
      this.currentOutput = null;
    }

    if (this.outputs[outputId]) {
      this.currentOutput = this.outputs[outputId];
    }

    if (this.currentOutput) {
      this.outputContainer.appendChild(this.currentOutput.element);
      this.currentOutput.start();
    }

    gtag('event', 'select_output', { id: outputId });
  }

  startWizardMode() {
    this.broadcastEvents = true;
  }

  stopWizardMode() {
    this.broadcastEvents = false;
  }

  trigger(id) {
    let index = this.classNames.indexOf(id);
    this.currentOutput.trigger(index);

    if (this.broadcastEvents) {
      let event = new CustomEvent('class-triggered', {
        detail: { id: id }
      });
      window.dispatchEvent(event);
    }
  }
}

import TweenMax from 'gsap';
import GLOBALS from './../../config.js';

import Selector from './../components/Selector.js';
import Button from './../components/Button.js';
import CamInput from './../components/CamInput.js';
import HighlightArrow from './../components/HighlightArrow.js';

import SpeechOutput from './../../outputs/SpeechOutput.js';
import GIFOutput from './../../outputs/GIFOutput.js';
import SoundOutput from './../../outputs/SoundOutput.js';

export default OutputSection;
