$(document).ready(function(){
	$("#load_btn").click(function(){
		var mapid = $("#mapid").val();
		//$("#testdiv").text("localhost/frame.php?map="+mapid);
		$("#iframe").attr("src","/frame.php?map="+mapid);
		//$("#frame").attr("src", "http://www.google.com/");
	});
}); 