
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
//not currently used
var replaceSavedItems = function(){
	if (savedItems === true) {
		items = savedItems;
	};
};



//display items according to preset options
var displayItems = function() {

    var $list = $('.list');       

	if (alphabetizeOn === true) {                                   //if alphabetize is on
		items.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });                                                         //sort items independent of case
        $('.alphabet-box').prop( 'checked', true );                 //make sure the option is checked
	};
	if (shuffleData === true ) {                                    //if shuffle is on
        alphabetizeOn = false;                                      //turn off auto-alphabetize
		shuffleArray(items);				                        //shuffle data
        $('.alphabet-box').prop( 'checked', false );                //uncheck alphabetize
        $('.shuffle-box').prop( 'checked', true );                  //check shuffle box
	};
    if (shuffleData === false) {                                    //if shuffle is off
        $('.shuffle-box').prop( 'checked', false );                 //uncheck shuffle box
    };
	//if (multiEntry === true) {
		//only fires if it's true from the start, not if it's fired by key recognition
	//}
	if (deleteOnClick === true) {                                   //if deletable is on
		$list.addClass("deletable");                                //make things appear deletable
		deleteFunction();                                           //run the delete function
		//figure out how to stop the delete function
	};

    $list.html('');                                                 // clear the last content of .list
    $.each(items, function (indexPosition) {                        // iterate through the list
        $list.append('<li class="' + indexPosition + '">' + this + '</li>'); // append a list item for each
    });
};


//grab items from input
$('.css-input').on('keyup', function (event) {              // listen to each keypress in the input box
    if (event.which === 13 && !event.shiftKey) {            // if just enter is pressed
        var $input = $(event.target);                       // take the reference to the inputbox
        var item = $input.val();                            // take the value of the input box 
        var itemTrimmed = item.trim();                      // trim leading and following white space
        var itemsSplit = itemTrimmed.split(/\r\n|\r|\n/g);  // split at each line break
        $.each(itemsSplit, function (indexPosition){        // take each split item
            items.push(itemsSplit[indexPosition]);          // add it to the array
        });
        $input.val('');                                     // clear the input box
    }
    if (event.which === 13 && event.shiftKey || event.which === 86 && (event.ctrlKey || event.metakey)) {     // if shift and enter or ctrl v are pressed
    	$('.css-input').addClass('multi-entry');			// Activate multi-entry mode
    	multiEntry = true;                                  // switch it on
    }
    if (event.which === 27) {                               // if escape is pressed
        $('.css-input').removeClass('multi-entry');         // de-activate multi-entry mode
        multiEntry = false;                                 // switch it off
        var $input = $(event.target);                       // take the reference to the inputbox
        $input.val('');                                     // clear the input box
    }
    
    displayItems();                                         // display all of the items

});

var deleteFunction = function(){
//delete items from array
    if (deleteOnClick === true) {
        $('ul.list').on('click', 'li', function () {    //on clicking a list item
            var arrayPosition = $(this).attr('class');  //grab the array position from the class
            items[arrayPosition] = " ";                 //replace it with a blank space
            $(this).addClass('inert');                  //make it look inert
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
$(".deletable-box").change(function() {     // if deletable is toggled
    if(this.checked) {                      // on
        deleteOnClick = true;               // switch deletable on
    }
    else{                                   // off
        deleteOnClick = false;              // switch deletable off
    }
    displayItems();                         // display items
});
$(".alphabet-box").change(function() {      // if alphabetize is toggled
    if(this.checked) {                      // on
        alphabetizeOn = true;               // switch alphabetize on
        shuffleData = false;                // switch shuffle off
    }
    else{                                   // off
        alphabetizeOn = false;              // switch alphabetize off
    }
    displayItems();                         // display items
});
$(".shuffle-box").change(function() {       // if shuffle is toggled
    if(this.checked) {                      // on
        shuffleData = true;                 // switch shuffle on
        alphabetizeOn = false;              // switch alphabetize off
    }
    else{                                   // off
        shuffleData = false;                // switch shuffle off
    }
    displayItems();                         // display items
});
$(".clear-button").click(function(){        // if clear button is clicked
    items.length = 0;                       // clear all data in items array
    displayItems();                         // display items
});


//some alphabetization code repurposed from
//http://stackoverflow.com/a/25431980
//http://stackoverflow.com/a/9645447
