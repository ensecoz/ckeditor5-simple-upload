import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FileRepository from "@ckeditor/ckeditor5-upload/src/filerepository";

import Adapter from "./adapter";

export default class SimpleUpload extends Plugin {
  static get requires() {
    return [FileRepository];
  }

  static get pluginName() {
    return "SimpleUpload";
  }

  init() {
    const url = this.editor.config.get("simpleUpload.uploadUrl");

    if (!url) {
      console.warn("simpleUpload.uploadUrl is not configured");
      return;
    }

    const maxWidth = this.editor.config.get("simpleUpload.maxWidth") || -1;
    const maxHeight = this.editor.config.get("simpleUpload.maxHeight") || -1;
    const maxSize = this.editor.config.get("simpleUpload.maxSize") || -1;

    const options = {
      url,
      maxWidth,
      maxHeight,
      maxSize
    };

    this.editor.plugins.get("FileRepository").createUploadAdapter = loader =>
      new Adapter(loader, options, this.editor.t);
  }
}
