var LexemeRow = React.createClass({
	render: function() {
		var pos = {
			"art": "Article",
			"verb": "Verb",
			"subs": "Noun",
			"nmpr": "Proper noun",
			"advb": "Adverb",
			"prep": "Preposition",
			"conj": "Conjunction",
			"prps": "Pers. Pronoun",
			"prde": "Demons. Pron.",
			"prin": "Interr. Pronoun",
			"intj": "Interjection",
			"nega": "Negative",
			"inrg": "Interrogative",
			"adjv": "Adjective",
		};
		return (
			<tr>
				<td>{pos[this.props.lex.pos]}</td>
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
		this.serverRequest = $.getJSON("data/lexemes.json", function (result) {
			this.setState({"lexeme_data": result});
		}.bind(this));
		return {
			"lexeme_data": [],
			"filter": "",
			"pos_filter": "*",
		};
	},
	handleChangeSelect(event) {
		this.setState({"pos_filter": event.target.value});
	},
	handleChangeText(event) {
		this.setState({"filter": event.target.value});
	},
	render: function() {
		var filtered_data = [];
		var that_pos_filter = this.state.pos_filter;
		var lx = this.state.pos_filter === "*" ? this.state.lexeme_data : this.state.lexeme_data.filter(function(x){
			return x["pos"] === that_pos_filter;
		});
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
			filtered_data = (this.state.filter === "") ? [] : lx.filter(function(x){
				return x["searchable_lexeme"].search(normalised_filter) !== -1;
			});
		}
		else
		{
			var that_filter = this.state.filter;
			filtered_data = (this.state.filter === "") ? [] : lx.filter(function(x){
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
		var pos = [
			{name: "*", title: "Part of Speech"},
			{name: "art", title: "Article"},
			{name: "verb", title: "Verb"},
			{name: "subs", title: "Noun"},
			{name: "nmpr", title: "Proper noun"},
			{name: "advb", title: "Adverb"},
			{name: "prep", title: "Preposition"},
			{name: "conj", title: "Conjunction"},
			{name: "prps", title: "Pers. Pronoun"},
			{name: "prde", title: "Demons. Pron."},
			{name: "prin", title: "Interr. Pronoun"},
			{name: "intj", title: "Interjection"},
			{name: "nega", title: "Negative"},
			{name: "inrg", title: "Interrogative"},
			{name: "adjv", title: "Adjective"},
		];

		return (
			<div>
				<h1>Find Hebrew Lexemes</h1>
				<form className="pure-form">
					<input type="text" onChange={this.handleChangeText} />
					<br />
					<select onChange={this.handleChangeSelect}>
						{pos.map(function(x, i){
							return (
								<option value={x.name}>
									{x.title}
								</option>
							);
						})}
					</select>
				</form>
				<div style={{margin: "0.3em"}}>Results: {filtered_data.length}{filtered_data.length > 20 ? " (only showing 20)" : ""}</div>

				<table className="pure-table">
					<thead><tr>
						<td>PoS</td>
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
