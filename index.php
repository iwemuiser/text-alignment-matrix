<!DOCTYPE html>
<html>
    <head>
        <script type="text/javascript" src="js/d3.min.js"></script>
        <script type="text/javascript" src="js/jquery-1.11.1.min.js"></script>
        <script type="text/javascript" src="js/knockout-3.1.0.js"></script>
        <script type="text/javascript" src="js/stemmer/lib/Snowball.min.js"></script>
        <script type="text/javascript" src="js/main.js"></script>
        <link rel="stylesheet" type="text/css" href="css/style.css" media="all"/>
        <style>

        .background {
          fill: #eee;
        }

        line {
          stroke: #fff;
        }

        text.active {
          fill: red;
        }

        </style>
        
        <title>Matrix</title>
        
        <script>
        
</script>

    </head>
  
    <body>
        
        <p>Order: <select id="order">
          <option value="sequence">by Original sequence</option>
          <option value="name">by Name</option>
          <option value="count">by Frequency</option>
        </select> 
        <br>
        <textarea id="text1" class="input-search" data-bind="value:text1" rows="4" cols="50" style='width:98%'>
        </textarea>
        <textarea id="text2" class="input-search" data-bind="value:text2" rows="4" cols="50" style='width:98%'>
        </textarea>
        <br>
        <input type="submit" value="Submit">
    </body>
</html>