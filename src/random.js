//Generates a random number between min and max (max included!)
export function generateNumber(min, max) {
    return Math.floor(Math.random() * (max+1)) + min;
}
function intToChar(int) {
    const code = 'a'.charCodeAt(0);
  
    return String.fromCharCode(code + int);
}
function intToUpperChar(int) {
    const code = 'A'.charCodeAt(0);
  
    return String.fromCharCode(code + int);
  }
export function generateRandomString(length_of_string) {
    let output = "";
    //Creates a random word with nonsense given we have a length of the string.
    for (let i =0; i < length_of_string; i++) {
        //First character is always capitalized
        if (i === 0) {
            output += intToUpperChar(generateNumber(0,25));
        } else {
            //There is a 20% chance that the letter generated is capitalized
            let index = generateNumber(0,6);
            if (index === 0) {
                output += intToUpperChar(generateNumber(0,25));
            } 
            else if (index <= 5) {
                output += intToChar(generateNumber(0,25));
            } else if (index === 6) {
                output += " ";
            }
        }
    }
    return output;
}