window.onload = function () {
    console.log("loading main");

    var vm = new ViewModel();
    ko.applyBindings(vm);

    var waitman = new WaitViewer(vm);
    waitman.init(true);
    
    var matrix = new MatrixViewer(vm);
    matrix.init();
    
}

var waiting = true;

var text1 = "";
var text2 = "";

var solr_search_proxy = 'data_proxy.php?s&q=';
var id_search_proxy = 'data_proxy.php?i&q=';
var facet_proxy = 'data_proxy.php?f&q='

var vb_search_link = "";

var solr_search_command = "";

var initial_neighbor_search = "";

var Stem = function(lng) {
    var testStemmer = new Snowball(lng);
    return function(word) {
      testStemmer.setCurrent(word);
      testStemmer.stem();
      return testStemmer.getCurrent();
    }
  };

function ViewModel() {
    
    var self = this;
    
    //if the system is waiting for something
    self.waiting = ko.observable(waiting);
    self.text1 = ko.observable(text1);
    self.text2 = ko.observable(text2);
    
//    self.texts = ko.
    
    self.doVBSearch = function () {
        self.clearData();
    };
    
    self.clearData = function(){
        self.text1("");
        self.text2("");
    }
};


function MatrixViewer(vm){
    
    this.init = function(){
    
        var margin = {top: 80, right: 0, bottom: 10, left: 80},
            width = 1000,
            height = 1000;

        var x = d3.scale.ordinal().rangeBands([0, width]);
        var y = d3.scale.ordinal().rangeBands([0, height]);
        var z = d3.scale.linear().domain([0, 4]).clamp(true);
        var c = d3.scale.category10().domain(d3.range(10));

        

//replace by vm value
        function update_data(){

            d3.select("body").select("svg").remove();

            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("margin-left", margin.left + "px")
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              svg.append("rect")
                .attr("class", "background")
                .attr("width", width)
                .attr("height", height);

              var row = svg.append("g")
                                .attr("class", "matrix")
                                .selectAll(".row");

              var column = svg.append("g")
                              .attr("class", "matrix")
                              .selectAll(".column");

              var tooltip = d3.select("body")
                  .append("div")
                  .style("position", "absolute")
                  .style("background", "white")
                  .style("z-index", "10")
                  .style("visibility", "visible")
                  .text("");

            var text1 = vm.text1();
            var text2 = vm.text2();

            if (text2.length > text1.length){
                var temp = text1;
                text1 = text2;
                text2 = temp;
            }

            texts = {};

            var split_text1 = super_split_and_stem(text1);
            var split_text2 = super_split_and_stem(text2);

//            var split_text1 = super_split(text1);
//            var split_text2 = super_split(text2);


            var matrix = [];
            var links = [];

            var n = split_text1.length
            var m = split_text2.length

            split_text1.forEach(function(node, i) {
              node.index = i;
              node.count = 0;
              matrix[i] = d3.range(m).map(function(j) { return {x: j, y: i, z: 0}; });
            });

            split_text2.forEach(function(node, i) {
              node.index = i;
              node.count = 0;
            });

            for (i in split_text1){
              for (j in split_text2){
                   if (split_text1[i].name[1] == split_text2[j].name[1]){
                       links.push({source: split_text1[i].index, target: split_text2[j].index, value: split_text1[i].name[1].length});
                   }
              }
            }
            
            console.log("links");
            console.log(links);

            texts["text1"] = split_text1;
            texts["text2"] = split_text2;
            texts["links"] = links;

            // Convert links to matrix; count character occurrences.
            texts.links.forEach(function(link) {
//                console.log(link);
//                console.log(split_text1[link.source]);
                matrix[link.source][link.target].z += link.value; //other
                matrix[link.source][link.target].name = split_text1[link.source].name; //other
        //      matrix[link.target][link.source].z += link.value;
        //      matrix[link.source][link.source].z += link.value; //self
        //        matrix[link.target][link.target].z += link.value;
                split_text1[link.source].count += link.value;
                split_text2[link.target].count += link.value;
            });

            console.log("texts:");
            console.log(texts);
            console.log("matrix:");
            console.log(matrix)
            
            // Precompute the orders.
            var orders = {
              sequence: [d3.range(n).sort(function(a, b) { return d3.ascending(split_text1[a].index, split_text1[b].index); }), d3.range(m).sort(function(a, b) { return d3.ascending(split_text2[a].index, split_text2[b].index); })],
              name: [d3.range(n).sort(function(a, b) { return d3.ascending(split_text1[a].name[0], split_text1[b].name[0]); }), d3.range(m).sort(function(a, b) { return d3.ascending(split_text2[a].name[0], split_text2[b].name[0]); })],
              count: [d3.range(n).sort(function(a, b) { return split_text1[b].count - split_text1[a].count; }), d3.range(m).sort(function(a, b) { return split_text2[b].count - split_text2[a].count; })],
            };

            // The default sort order.
            x.domain(orders.sequence[0]);
//            y.domain(orders.sequence[1]);

//###########################################################################################


            var row = svg.selectAll(".row")
                .data(matrix)
              .enter().append("g")
                .attr("class", "row")
                .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
                .each(roww);

/*            row.append("line")
                .attr("x2", width);*/

            row.append("text")
                .attr("x", -6)
                .attr("y", x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "end")
                .text(function(d, i) { return split_text1[i].name[0]; });

//###################################################################`

            var column = svg.selectAll(".column")
                .data(matrix)
              .enter().append("g")
                .attr("class", "column")
                .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

/*            column.append("line")
                .attr("x1", -width);*/

            column.append("text")
                .attr("x", 6)
                .attr("y", x.rangeBand() / 2)
                .attr("dy", ".32em")
                .attr("text-anchor", "start")
                .text(function(d, i) { 
                    if (split_text2[i]){
//                        console.log(split_text2[i]);
                        return split_text2[i].name[0]; 
                    }
                });

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

            function roww(row) {
                var cell = d3.select(this).selectAll(".cell")
                    .data(row.filter(function(d) { return d.z; }))
                  .enter().append("rect")
                    .attr("class", "cell")
                    .attr("x", function(d) { return x(d.x); })
                    .attr("width", Math.max(x.rangeBand(), 4))
                    .attr("height", Math.max(x.rangeBand(), 4))
                    .style("fill-opacity", 1) //word length
                    .style("fill-opacity", function(d) { return z(d.z); }) //word length
//                    .style("fill", function(d) { return split_text1[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; }) //word type??
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout)
                    .on("mousemove", mousemove);
                    
//                cell.exit().remove();
            }
            
            function check_metadata(d){
                metadata_items = {named_entity: "red",
                                    named_entity_location: "green",
                                    tags: "blue"};
                //check text and metadata fields in VM.
                //return color if match
            }
            

            function mouseover(p) {
//                console.log(d3.select(this));
                d3.select(this).attr("fill", "red");
                d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
                d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
                tooltip.style("visibility", "visible")
                    .text(function() {
                            return p.name[0]; 
                    });
            }

            function mouseout() {
                d3.select(this).attr("fill", "black");
                d3.selectAll("text").classed("active", false);
                tooltip.style("visibility", "hidden");
            }
            
            
            function mousemove(){
                tooltip.style("top", (event.pageY-10)+"px")
                        .style("left",(event.pageX+10)+"px");
            }

            d3.select("#order").on("change", function() {
    //        clearTimeout(timeout);
                order(this.value);
            });

            function order(value) {
                x.domain(orders[value][0]);
//                x.domain(orders[value][1]);

                var t = svg.transition().duration(1500);

                t.selectAll(".row")
                    .delay(function(d, i) { return x(i) * 4; })
                    .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
                    .selectAll(".cell")
                    .delay(function(d) { return x(d.x) * 4; })
                    .attr("x", function(d) { return x(d.x); });

                t.selectAll(".column")
                    .delay(function(d, i) { return x(i) * 4; })
                    .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
            }
        
            function super_split_and_stem(text){
                nodes = [];
                words = text.replace(/[!?,\.:"'\[\]\(\) ]+/g, ' ').replace(/\s+/g, '|').replace(/\.\s+/g, '|').replace(/\?\s/g, '|').replace(/\!\s/g, '|').split("|");
                for (i in words){
                    word = [words[i], new Stem("dutch")(words[i].toLowerCase())];
                    nodes.push({name: word, length: word.length});
                }
                return nodes;
            }
        
            function super_split(text){
                nodes = [];
                words = text.replace(/[!?,\.:"'\[\]\(\) ]+/g, ' ').replace(/\s+/g, '|').replace(/\.\s+/g, '|').replace(/\?\s/g, '|').replace(/\!\s/g, '|').split("|");
                for (i in words){
                    nodes.push({name: words[i], length: words[i].length});
                }
                return nodes;
            }
        }        
        
        vm.text1.subscribe( function (){
            console.log("text1 changed");
            update_data();
        });

        vm.text2.subscribe( function (){
            console.log("text2 changed");
            update_data();
        });
        
    }
}


//fires when the system is waiting for data (location data, since this loads the longest by far)
function WaitViewer(vm){

    var waiting = false;
    
    this.init = function(waiting){
        
        check_for_wait();
        
        vm.waiting.subscribe( function (){
            waiting = vm.waiting();
            check_for_wait();
        });
            
        function check_for_wait(){    
            if (vm.waiting()){
                d3.select("#waitWindow")
                    .style("opacity", 1)
                    .style("background", "green")
                    .transition()
                    .delay(100)
                    .style("visibility", "visible");
            }
            else {
                d3.select("#waitWindow")
                    .transition()
                    .duration(100)
                    .style("opacity", 0)
                    .transition()
                    .delay(100)
                    .style("visibility", "hidden");
            }
        }
    }
}