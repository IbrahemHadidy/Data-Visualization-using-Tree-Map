const KICKSTARTER_BUTTON = d3.selectAll(".Kickstarter-dataset");
const MOVIES_BUTTON = d3.selectAll(".Movies-dataset");
const VIDEOGAMES_BUTTON = d3.selectAll(".Video-Games-Movies-dataset");
const TITLE = d3.select("#title");
const DESCRIPTION = d3.select("#description");
const TOOLTIP = d3.select("#tooltip");
const COLORS = d3.scaleOrdinal(d3.schemeCategory10);

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const updateOutput = async (titleText, descriptionText, dataUrl) => {
  try {
    TITLE.text(titleText);
    DESCRIPTION.text(descriptionText);

    const data = await fetchData(dataUrl);
    const treemapLayout = d3.treemap().size([1200, 800]).padding(1);
    const root = d3.hierarchy(data).sum(d => d.value).sort((a, b) => b.value - a.value);

    treemapLayout(root);

    d3.select("svg").remove();

    const svg = d3.select("#treemap")
                  .append("svg")
                  .attr("width", 1200)
                  .attr("height", 800)
                  .style("overflow", "visible");

    const tiles = svg.selectAll("g")
                     .data(root.leaves())
                     .join("g")
                     .attr("transform", ({ x0, y0 }) => `translate(${x0},${y0})`);

    tiles.append("rect")
         .attr("class", "tile")
         .attr("data-name", ({ data }) => data.name)
         .attr("data-category", ({ data }) => data.category)
         .attr("data-value", ({ data }) => data.value)
         .attr("width", ({ x1, x0 }) => x1 - x0)
         .attr("height", ({ y1, y0 }) => y1 - y0)
         .attr("fill", ({ data }) => COLORS(data.category))
         .on("mouseover", handleMouseOver)
         .on("mouseout", handleMouseOut);

    tiles.append("foreignObject")
         .attr("class", "tile-text")
         .attr("x", 0)
         .attr("y", 0)
         .attr("width", ({ x1, x0 }) => x1 - x0)
         .attr("height", ({ y1, y0 }) => y1 - y0)
         .style("pointer-events", "none")
         .append("xhtml:div")
         .style("font-size", "0.8em")
         .style("position", "relative")
         .style("top", "50%")
         .style("left", "50%")
         .style("transform", "translate(-50%, -50%)")
         .html(({ data }) => data.name);

    const uniqueCategories = [...new Set(root.leaves().map(({ data }) => data.category))];
    const itemsPerRow = 3;

    const legend = d3.select("#legend").selectAll("*").remove();
    const legendRows = d3.select("#legend").selectAll(".legend-row")
                        .data(d3.range(Math.ceil(uniqueCategories.length / itemsPerRow)))
                        .join("div")
                        .attr("class", "legend-row");

    const legendItems = legendRows.selectAll("div")
                                  .data((d, i) => uniqueCategories.slice(i * itemsPerRow, (i + 1) * itemsPerRow))
                                  .join("div");

    legendItems.html(category => `<svg width="12" height="12"><rect class="legend-item" width="12" height="10" x="-2" y="2" fill="${COLORS(category)}"></rect></svg>${category}`);
  } catch (error) {
    console.error("Error updating output:", error);
  }
};

const handleMouseOver = (event, { data }) => {
  TOOLTIP.attr("data-value", data.value)
         .html(`<strong>${data.name}</strong><br>Category: ${data.category}<br>Value: ${data.value}`)
         .style("left", event.pageX + 10 + "px")
         .style("top", event.pageY - 30 + "px")
         .classed("hidden", false);
};

const handleMouseOut = () => {
  TOOLTIP.classed("hidden", true);
};

// Call updateOutput with Video Games dataset as default
updateOutput("Video Game Sales", "Top 100 Most Sold Video Games Grouped by Platform", "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json");

// Event listeners for dataset buttons
KICKSTARTER_BUTTON.on("click", () => {
  updateOutput("Kickstarter Pledges", "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category", "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json");
});

MOVIES_BUTTON.on("click", () => {
  updateOutput("Movie Sales", "Top 100 Highest Grossing Movies Grouped By Genre", "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json");
});

VIDEOGAMES_BUTTON.on("click", () => {
  updateOutput("Video Game Sales", "Top 100 Most Sold Video Games Grouped by Platform", "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json");
});
