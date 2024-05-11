"use strict";

class FrameManager {
  constructor({
    topFrameLocation,
    topWindowURL,
    inputFields = ["input", "select", "textarea"],
  }) {
    this.topFrameLocation = topFrameLocation;
    this.topWindowURL = topWindowURL;
    this.inputFields = inputFields;
    this.totalFrames = this.countFrames(window.top);
  }

  getTopFrame() {
    return window.top.frames[0];
  }

  isTopFrame() {
    return window.location.pathname === this.topFrameLocation;
  }

  sortFieldsByNameAscending(array) {
    return array.slice().sort((a, b) => {
      const keyA = Object.keys(a)[0];
      const keyB = Object.keys(b)[0];
      return keyA.localeCompare(keyB) || a[keyA].localeCompare(b[keyB]);
    });
  }

  countFrames(windowObj) {
    let count = 0;

    for (let i = 0; i < windowObj?.frames?.length; i++) {
      count++;
      count += this.countFrames(windowObj?.frames[i]);
    }

    return count;
  }

  scrapeFields() {
    try {
      const form = window.document.querySelector("form");
      if (!form) {
        return [];
      }

      const inputs = form.querySelectorAll(this.inputFields.join(", "));
      return Array.from(inputs).map(({ id, name }) => {
        const labelElement = form.querySelector(`label[for="${id}"]`);
        return { [name]: labelElement?.textContent };
      });
    } catch (error) {
      console.error("Error scraping fields:", error);
    }
  }

  execute() {
    try {
      const fields = this.scrapeFields();

      if (!this.isTopFrame()) {
        this.getTopFrame().postMessage(fields, this.topWindowURL);
        return;
      }

      let countFrames = 0;
      let mergedFields = [];

      mergedFields.push(...fields);

      this.getTopFrame().addEventListener("message", ({ data }) => {
        console.log("Received fields from child frame:", data);
        countFrames++;
        mergedFields.push(...data);

        if (countFrames === this.totalFrames) {
          const sortedFields = this.sortFieldsByNameAscending(mergedFields);
          const framesLoadedEvent = new CustomEvent("frames:loaded", {
            detail: { fields: sortedFields },
          });
          window.document.dispatchEvent(framesLoadedEvent);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
}

const frameManager = new FrameManager({
  topFrameLocation: "/context.html",
  topWindowURL: "http://localhost:9999/?id=25360429",
});

frameManager.execute();
