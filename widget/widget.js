"use strict";

/*
 The FrameManager class provides methods to retrieve fields from forms,
 count the number of frames recursively,
 and execute actions based on frame communication
*/
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

  // Returns the top frame of the window
  getTopFrame() {
    return window.top.frames[0];
  }

  // Checks whether the current frame is the top frame based on the window's pathname
  isTopFrame() {
    return window.location.pathname === this.topFrameLocation;
  }

  /*
   Sorts an array of {name: label} pairs alphabetically 
   by name in ascending order, handling duplicate keys if present
  */
  sortFieldsByNameAscending(array) {
    // Create a copy of the input array using the slice function then sort this copied array
    return array.slice().sort((a, b) => {
      // Extract the first key of each object, assuming that each object contains only one key-value pair
      const keyA = Object.keys(a)[0];
      const keyB = Object.keys(b)[0];
      /*
       Compare keyA and keyB by localCompare function and 
       if they are equal also compare their values to handle duplicate keys
      */
      return keyA.localeCompare(keyB) || a[keyA].localeCompare(b[keyB]);
    });
  }

  // Recursively counts the number of frames within a given window object
  countFrames(windowObj) {
    let count = 0;

    for (let i = 0; i < windowObj?.frames?.length; i++) {
      count++;
      count += this.countFrames(windowObj?.frames[i]);
    }

    return count;
  }

  /*
   Retrieves fields from an existing form in pairs of {name: label},
   querying input elements and their corresponding labels
  */
  scrapeFields() {
    try {
      const form = window.document.querySelector("form");
      if (!form) {
        return [];
      }

      const inputs = form.querySelectorAll(this.inputFields.join(", "));
      return Array.from(inputs).map(({ id, name }) => {
        //Query label with for attribute equal to the input's id
        const labelElement = form.querySelector(`label[for="${id}"]`);
        return { [name]: labelElement?.textContent };
      });
    } catch (error) {
      console.error("Error scraping fields:", error);
    }
  }

  /*
   Coordinates the process, from scraping form fields and
   sending them to the top frame if necessary, 
   to merging and sorting the fields, 
   and dispatching a "frames:loaded" event 
   when all frames have sent their data.
  */
  execute() {
    try {
      // Step 1 Scrape Fields and Create Fields list object.
      const fields = this.scrapeFields();

      // Child frames sends Fields up to Top Frame.
      if (!this.isTopFrame()) {
        this.getTopFrame().postMessage(fields, this.topWindowURL);
        return;
      }

      let countFrames = 0;
      let mergedFields = [];

      mergedFields.push(...fields);
      // Step 2 Add Listener for Top Frame to Receive Fields.

      this.getTopFrame().addEventListener("message", ({ data }) => {
        console.log("Received fields from child frame:", data);
        // Count number of frames that have sent their fields
        countFrames++;
        // - Merge fields from frames.

        mergedFields.push(...data);

        if (countFrames === this.totalFrames) {
          // Sort merged fields and send "frames:loaded" event
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

/*
 Initialise a new FrameManager instance
 with topFrameLocation, topWindowURL & default inputFields values
*/
const frameManager = new FrameManager({
  topFrameLocation: "/context.html",
  topWindowURL: "http://localhost:9999/?id=25360429",
});

frameManager.execute();
