var ProductsTableComponent = React.createClass({
	render: function () {
		var products = this.props.products;
		var display_cols = ["ID","SKU","Name","Units Sold","View Count"];
		var cols = ["id","sku","name","total_sold","view_count"];

		if(products.length) {
			var thead = React.DOM.thead(
				{}, 
				React.DOM.tr(
					{},
					display_cols.map(function (col) {
						return React.DOM.th({}, col);
					})
				)
			);

			
			var tbody = React.DOM.tbody(
				{}, 	
				products.map(function (product) {
					return React.DOM.tr(
						{},
						cols.map(function (col) {
							return React.DOM.td({}, product[col] || "");
						})
					)
				})		
			);
		} else {
			var thead = React.DOM.thead(
				{}, 
				{}
			);
			
			var tbody = React.DOM.tbody(
				{}, 	
				{}		
			);
		}

		return React.DOM.table({style: {border: "1px"}}, [thead, tbody]);
	}
});
