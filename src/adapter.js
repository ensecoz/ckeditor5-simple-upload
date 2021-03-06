import ImageTools from "./imagetools";

/**
 * @private
 */
export default class Adapter {
  constructor(loader, options, t) {
    this.loader = loader;
    this.options = options;
    this.t = t;
  }

  upload() {
    return new Promise((resolve, reject) => {
      this._initRequest();
      this._initListeners(resolve, reject);
      this._sendRequest();
    });
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());

    const url = this.options.url;
    const headers = this.options.headers || null;

    xhr.withCredentials = true;
    xhr.open("POST", url, true);
    if (headers !== null) {
      for (let key in headers) {
        if (typeof headers[key] === "function") {
          xhr.setRequestHeader(key, headers[key]());
        } else {
          xhr.setRequestHeader(key, headers[key]);
        }
      }
    }

    xhr.responseType = "json";
  }

  _initListeners(resolve, reject) {
    const xhr = this.xhr;
    const loader = this.loader;
    const t = this.t;
    const genericError = t("Cannot upload file:") + ` ${loader.file.name}.`;

    xhr.addEventListener("error", () => reject(genericError));
    xhr.addEventListener("abort", () => reject());
    xhr.addEventListener("load", () => {
      const response = xhr.response;

      if (!response || !response.uploaded) {
        return reject(
          response && response.error && response.error.message
            ? response.error.message
            : genericError
        );
      }

      resolve({
        default: response.url
      });
    });

    if (xhr.upload) {
      xhr.upload.addEventListener("progress", evt => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  _sendRequest() {
    const data = new FormData();

    if (this.options.maxHeight > -1 || this.options.maxWidth > -1) {
      new ImageTools()
        .resize(this.loader.file, {
          width: this.options.maxWidth,
          height: this.options.maxHeight
        })
        .then(file => {
          data.append("upload", file);
          this.xhr.send(data);
        });
    } else {
      data.append("upload", this.loader.file);
      this.xhr.send(data);
    }
  }
}
