const english = require("../language/english.json")

module.exports = (location, options={}) => {
  let string = eval(`english.${location}`)
  string = string[Math.floor(Math.random()*string.length)]

  for(let key of Object.keys(options)) {
    string = string.replace(new RegExp(`{{${key}}}`, "g"), options[key])
  }

  return string;
}