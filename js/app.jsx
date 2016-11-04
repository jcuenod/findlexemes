var LexemeRow = React.createClass({
	render: function() {
		return (
			<tr>
				<td style={{fontFamily: 'SBL Hebrew', fontSize: '130%'}}>
					{this.props.lex.lexeme.replace(/[\/\[=]/g,"")}
				</td>
				<td>{this.props.lex.gloss}</td>
				<td>{this.props.lex.frequency}</td>
			</tr>
		);
	}
});

var App = React.createClass({
	getInitialState: function() {
		this.serverRequest = $.getJSON("data/lexeme_gloss_rank.json", function (result) {
			this.setState({"lexeme_data": result});
		}.bind(this));
		return {
			"lexeme_data": [],
			"filter": ""
		};
	},
	handleChange(event) {
		this.setState({"filter": event.target.value});
	},
	render: function() {
		var filtered_data = [];
		if (this.state.filter.match(/[^\u0000-\u007F]+/))
		{
			var replaceFinals = (function() {
				var translate_re = /[ךםןףץ]/g;
				var translate = {
					"ך": "כ",
					"ם": "מ",
					"ן": "נ",
					"ף": "פ",
					"ץ": "צ",
				};
				return function(s) {
					return ( s.replace(translate_re, function(match) {
						return translate[match];
					}) );
				}
			})();
			var normalised_filter = replaceFinals(this.state.filter)
			filtered_data = (this.state.filter === "") ? [] : this.state.lexeme_data.filter(function(x){
				return x["searchable_lexeme"].search(normalised_filter) !== -1;
			});
		}
		else
		{
			var that_filter = this.state.filter;
			filtered_data = (this.state.filter === "") ? [] : this.state.lexeme_data.filter(function(x){
				return x["gloss"].search(new RegExp(that_filter, "i")) !== -1;
			});
		}
		var top_results = filtered_data.slice(0, 20);
		var sorted_filtered_data = top_results.sort(function(a, b){
			if (+a["frequency"] > +b["frequency"])
				return -1;
			if (+a["frequency"] < +b["frequency"])
				return 1;
			return 0;
		});
		return (
			<div>
				<h1>Find Hebrew Lexemes</h1>
				<form className="pure-form">
					<input type="text" onChange={this.handleChange}></input>
				</form>
				<div>Results: {filtered_data.length}{filtered_data.length > 20 ? " (only showing 20)" : ""}</div>
				<table className="pure-table">
					<thead><tr>
						<td>Lexeme</td>
						<td>Gloss</td>
						<td>Occurrences*</td>
					</tr></thead>
					<tbody>
						{top_results.map(function(data, i){
							return <LexemeRow key={i} lex={data}></LexemeRow>
						})}
					</tbody>
				</table>
				<span style={{
						fontStyle: "italic",
						fontSize: "90%"
					}}>
					* occurrences of this specific sense of the root according to etcbc data
				</span>
			</div>
		);
	}
});

ReactDOM.render(
	<App />,
	document.getElementById('app')
);
