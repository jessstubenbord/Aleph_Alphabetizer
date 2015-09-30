//basis of alphabetization code from
//http://stackoverflow.com/a/25431980
//http://stackoverflow.com/a/9645447

// still need to add:
//clearing all items
//more things

//string logic
///tolowercase
///check for returns


var alphabetizeOn = true;
var instantEntry = true;
var deleteOnClick = false;
var multiEntry = false;
var openOptions = true;


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
		items.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });         						//sort items
        $('.alphabet-box').prop( 'checked', true );
	};
	if (shuffleData === true ) {
        alphabetizeOn = false;              //turn off auto-alphabetize
		shuffleArray(items);				//shuffle data
        $('.alphabet-box').prop( 'checked', false );
        $('.shuffle-box').prop( 'checked', true );
		if (alwaysShuffleData === false) {
			//shuffleData = false;			//don't shuffle it next time
            //$('.shuffle-box').prop( 'checked', false );
		};
	};
    if (shuffleData === false) {
        $('.shuffle-box').prop( 'checked', false );
    };
	if (multiEntry === true) {
		//only fires if it's true from the start, not if it's fired by key recognition
	}
	if (deleteOnClick === true) {
		$list.addClass("deletable");
		deleteFunction();//run the delete function
		//figure out how to stop the delete function
	};

    $list.html('');                            // clear the last content of .word-list
    $.each(items, function (indexPosition) {                // iterate through the words
        $list.append('<li class="' + indexPosition + '">' + this + '</li>'); // append a list item for each word (this refers to the word in the array
    });
};


//grab items from input
$('.css-input').on('keyup', function (event) {              // listen to each keypress in the input box
    if (event.which === 13 && !event.shiftKey) {            // if enter is pressed
        var $input = $(event.target);                       // take the reference to the inputbox
        var item = $input.val();                            // take the value of the input box 
        var itemTrimmed = item.trim();                      // trim leading and following white space
        //var itemsSplit = itemTrimmed.split(/\r\n|\r|\n/g);
        items.push(itemTrimmed);                            // add it to the array
        $input.val('');                                     // clear the input box

        //displayItems();                                   /// show the words
    }
    if (event.which === 13 && event.shiftKey) {             // if enter and shift are pressed
    	$('.css-input').addClass('multi-entry');			//Activate multi-entry mode
    	multiEntry = true;
    }
    if (event.which === 27) {                               // if escape is pressed
        $('.css-input').removeClass('multi-entry');         //de-activate multi-entry mode
        multiEntry = false;
        var $input = $(event.target);                       // take the reference to the inputbox
        $input.val('');                                     // clear the input box
    }

    else{
    	displayItems();
    }


});

var deleteFunction = function(){
//delete items from array
    if (deleteOnClick === true) {
        $('ul.list').on('click', 'li', function () {    //on clicking a list item
            var arrayPosition = $(this).attr('class');  //grab the array position from the class
            items[arrayPosition] = " ";                 //replace it with a blank space
            $(this).addClass('inert');
            //$(this).empty(); //make it dissapear
            //$(this).html('<a href="#undid">undo</a>');//add undo link
            //remove from array
        });
    }
    else{
        $('.list').removeClass('deletable');
        //stop the delete function
    };
};

//option Checkbox actions
$(".deletable-box").change(function() {
    if(this.checked) {
        deleteOnClick = true;
    }
    else{
        deleteOnClick = false;
    }
    displayItems();
});
$(".alphabet-box").change(function() {
    if(this.checked) {
        alphabetizeOn = true;
        shuffleData = false;
    }
    else{
        alphabetizeOn = false;
    }
    displayItems();
});
$(".shuffle-box").change(function() {
    if(this.checked) {
        shuffleData = true;
        alphabetizeOn = false
    }
    else{
        shuffleData = false;
    }
    displayItems();
});
$(".clear-button").click(function(){
    items.length = 0;   // clear all data in items array
    displayItems();
});

