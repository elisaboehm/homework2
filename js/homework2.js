// Add an event listener to the element with ID 'first-paragraph'
document.getElementById('first-paragraph').addEventListener('click', event => {
    
    // 'event.target' refers to the specific HTML element that was clicked
    // '.style' accesses the inline style properties of that element
    // We store that reference in a variable called 'style' so we can easily change multiple style properties later
    var style = event.target.style;
    
    // Change the background color of the clicked element to blue
    style.background = 'blue';
    
    // Change the text color of the clicked element to red
    style.color = 'red';
 })