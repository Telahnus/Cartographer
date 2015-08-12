<!DOCTYPE html>

<html>

<head>
    <title>Legrica Sector</title>
    <!-- <link rel="stylesheet" type="text/css" href="css/map.css"> -->
    <script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
</head>

<body>
<?php
    //get map id from GET
    $mapid = $_GET['map'];
    $filename = "img/".$mapid.".jpg";
    if (file_exists($filename)) {
    	//echo "The file $filename exists";
    	echo "<img src=\"$filename\" alt=\"basemap\">";
	} else {
	    //echo "The file $filename does not exist";
	    echo "<img src=\"img/graph.jpg\" alt=\"basemap\">";
	}
?>
</body>

</html>