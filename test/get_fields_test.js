const expect = chai.expect;

expectation = [
  { address_line_1: "Address Line 1" },
  { cc_number: "Number" },
  { cc_type: "Type" },
  { country: "Country" },
  { first_name: "First Name" },
  { last_name: "Last Name" },
];

describe("Widget #getFields", () => {
  before((done) => {
    fixture.setBase("assets");
    fixture.load("top.html");

    document.addEventListener("frames:loaded", (event) => {
      this.result = event.detail.fields;
      done();
    });
  });

  it("should extract the fields", () => {
    console.log(this.result);
    expect(this.result).to.deep.equal(expectation);
  });
});

describe("Widget #scrapeFields", () => {
  it("should return an empty array if no form is found", function () {
    document.body.innerHTML = "<h1>Hello</h1>";
    expect(frameManager.scrapeFields()).to.deep.equal([]);
  });

  it("should return an empty array if form has no input, select, or textarea fields", function () {
    document.body.innerHTML = "<form></form>";
    expect(frameManager.scrapeFields()).to.deep.equal([]);
  });

  it("should return an array with one object if form has only one input element", function () {
    document.body.innerHTML =
      '<form><label for="testName">Test Label</label><input id="testName" name="testName"></form>';
    expect(frameManager.scrapeFields()).to.deep.equal([
      { testName: "Test Label" },
    ]);
  });

  it("should return an empty array if form has elements other than input, select, or textarea", function () {
    document.body.innerHTML = "<form><div></div></form>";
    expect(frameManager.scrapeFields()).to.deep.equal([]);
  });

  it("should return an array of objects with name and label pairs for each input element", function () {
    document.body.innerHTML = `
    <form>
      <label for="name1">Label 1</label>
      <input id="name1" name="name1">
      <label for="name2">Label 2</label>
      <input id="name2" name="name2">
      <label for="name3">Label 3</label>
      <input id="name3" name="name3">
    </form>
  `;
    expect(frameManager.scrapeFields()).to.deep.equal([
      { name1: "Label 1" },
      { name2: "Label 2" },
      { name3: "Label 3" },
    ]);
  });
});

describe("Widget #sortFieldsByNameAscending", () => {
  it("should return an empty array if input array is empty", () => {
    const result = frameManager.sortFieldsByNameAscending([]);
    expect(result).to.be.an("array").that.is.empty;
  });

  it("should return the same array if it has only one element", () => {
    const input = [{ first_name: "First Name" }];
    const result = frameManager.sortFieldsByNameAscending(input);
    expect(result).to.deep.equal(input);
  });

  it("should sort an array of objects by name in ascending order", () => {
    const input = [
      { last_name: "Last Name" },
      { first_name: "First Name" },
      { country: "Country" },
      { address_line_1: "Address Line 1" },
    ];
    const expected = [
      { address_line_1: "Address Line 1" },
      { country: "Country" },
      { first_name: "First Name" },
      { last_name: "Last Name" },
    ];
    const result = frameManager.sortFieldsByNameAscending(input);
    expect(result).to.deep.equal(expected);
  });

  it("should handle arrays with objects having duplicate names", () => {
    const input = [
      { last_name: "Last Name" },
      { first_name: "First Name" },
      { country: "Country" },
      { address_line_1: "Address Line 1" },
      { last_name: "Another Last Name" },
    ];
    const expected = [
      { address_line_1: "Address Line 1" },
      { country: "Country" },
      { first_name: "First Name" },
      { last_name: "Another Last Name" },
      { last_name: "Last Name" },
    ];
    const result = frameManager.sortFieldsByNameAscending(input);
    expect(result).to.deep.equal(expected);
  });
});

describe("Widget #countFrames", () => {
  it("should return 0 for a window with no frames", () => {
    const windowObj = { frames: [] };
    const result = frameManager.countFrames(windowObj);
    expect(result).to.equal(0);
  });

  it("should return the correct count for a window with frames", () => {
    const windowObj = {
      frames: [
        { frames: [] }, // One frame with no sub-frames
        { frames: [{}, {}] }, // One frame with two sub-frames
        {}, // One frame with no sub-frames
      ],
    };
    const result = frameManager.countFrames(windowObj);
    expect(result).to.equal(5); // Total frames: 1 + 2 + 2 = 5
  });
});
