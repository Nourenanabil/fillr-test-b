const expect = chai.expect;

expectation = [
  { "address_line_1" : "Address Line 1" },
  { "cc_number" : "Number" },
  { "cc_type" : "Type" },
  { "country" : "Country" },
  { "first_name" : "First Name" },
  { "last_name" : "Last Name" }
];

describe('Widget #getFields', () => {

  before((done) => {
    fixture.setBase('assets');
    fixture.load('top.html');

    document.addEventListener('frames:loaded', (event) => {
      this.result = event.detail.fields
      done();
    });
  });

  it('should extract the fields', () => {
    console.log(this.result);
    expect(this.result).to.deep.equal(expectation);
  });
});

describe("Widget #scrapeFields", () =>{

  it('should return an empty array if no form is found', function() {
    document.body.innerHTML = '<h1>Hello</h1>';
    expect(scrapeFields()).to.deep.equal([]);
  });
  
  it('should return an empty array if form has no input, select, or textarea fields', function() {
    document.body.innerHTML = '<form></form>';
    expect(scrapeFields()).to.deep.equal([]);
  });
  
  it('should return an array with one object if form has only one input element', function() {
    document.body.innerHTML = '<form><label for="testName">Test Label</label><input id="testName" name="testName"></form>';
    expect(scrapeFields()).to.deep.equal([{ "testName": 'Test Label' }]);
  });
  
  it('should return an empty array if form has elements other than input, select, or textarea', function() {
    document.body.innerHTML = '<form><div></div></form>';
    expect(scrapeFields()).to.deep.equal([]);
  });
  
  it('should return an array of objects with name and label pairs for each input element', function() {
    document.body.innerHTML = `
    <form>
      <label for="name1">Label 1</label>
      <input id="name1" name="name1">
      <label for="name2">Label 2</label>
      <input id="name2" name="name2">
      <label for="name3">Label 3</label>
      <input id="name3" name="name3">
    </form>
  `;  expect(scrapeFields()).to.deep.equal([
      { name1: 'Label 1' },
      { name2: 'Label 2' },
      { name3: 'Label 3' }
    ]);
  });
})
