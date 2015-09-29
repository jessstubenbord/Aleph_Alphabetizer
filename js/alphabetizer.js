//basis of alphabetization code from
//http://stackoverflow.com/a/25431980
//http://jsfiddle.net/albertmatyi/avvxuomb/

// still need to add:
//clearing all items
//more things

var alphabetizeOn = true;
var instantEntry = true;
var deleteOnClick = false;
var multiEntry = false;
var openOptions = false;


var shuffleData = false;
var alwaysShuffleData = false;
var clearData = false;

var items = new Array();


//code used for shuffling arrays
//from here http://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

///check if there are stored items from a previous session and load them into items
var replaceSavedItems = function(){
	if (savedItems === true) {
		items = savedItems;
	};
};

//check if in multi-entry mode


//display items according to preset options
var displayItems = function() {

    var $list = $('.list');       

	if (alphabetizeOn === true) {
		items.sort();						//sort items
	};
	if (shuffleData === true ) {
		shuffleArray(items);				//shuffle data
		if (alwaysShuffleData === false) {
			shuffleData = false;			//don't shuffle it next time
		};
	};
	if (multiEntry === true) {
		//only fires if it's true from the start, not if it's fired by key recognition
	}
	if (deleteOnClick === true) {
		$list.addClass("deletable");
		deleteFunc();//run the delete function
		//figure out how to stop the delete function
	};

    $list.html('');                            // clear the last content of .word-list
    $.each(items, function (indexPosition) {                // iterate through the words
        $list.append('<li class="' + indexPosition + '">' + this + '</li>'); // append a list item for each word (this refers to the word in the array
    });
};


//grab items from input
$('.css-input').on('keyup', function (event) { // listen to each keypress in the input box
    if (event.which === 13 && !event.shiftKey) {             // if enter is pressed
        var $input = $(event.target);     // take the reference to the inputbox
        var item = $input.val();      // take the value of the input box 
        items.push(item);             // add it to the array
        $input.val('');               // clear the input box

        //displayItems();                  // show the words
    }
    if (event.which === 13 && event.shiftKey) {             // if enter and shift are pressed
    	$('.css-input').addClass('multi-entry');			//Activate multi-entry mode
    	multiEntry = true;
    }
    else{
    	displayItems();
    }

});

var deleteFunc = function(){
//delete items from array
 $('ul.list').on('click', 'li', function () {
 	////save text from item
 	$(this).empty(); //make it dissapear
 	$(this).html('<a href="#undid">undo</a>');//add undo link
 	//remove from array

    });

}
