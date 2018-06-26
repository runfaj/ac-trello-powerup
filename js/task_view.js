var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

this.boards = null;
this.getBoards();

this.boardData = [
{
	board: 'WB',
	lists: [
	{
		list:'Design',
		items:[
			{
				title: 'Build the Things',
				priority: 'High',
				hours: '18',
				assigned: ['Tom', 'Hiccup', 'Macho'],
				due: '12/25/11'
			},
			{
				title: 'Click the Button',
				priority: 'Low',
				hours: '1',
				assigned: ['Tom'],
				due: '12/25/11'
			}
		]
	},
	{
		list:'Programming',
		items:[
			{
				title: 'Look',
				priority: 'Low',
				hours: '12',
				assigned: [],
				due: '12/25/11'
			},
			{
				title: 'Fix the World',
				priority: 'High',
				hours: '180',
				assigned: ['Tom', 'Angle', 'Macho'],
				due: '12/25/11'
			}
		]
	},
	{
		list:'QC',
		items:[
		]
	}]
},
{
	board: 'Helping',
	lists: [
	{
		list:'QC',
		items:[
		
		]
	}]
}];

console.log(this.boardData);

for(var i = 0; i < this.boardData.length; i++)
{
	var table = "<table class='" + this.boardData[i].board + "Table' >";
	table += "<th class='boardRow'>" + this.boardData[i].board + "</th>";

	// add .board collapse box
	for(var y = 0; y < this.boardData[i].lists.length; y++)
	{
		table += "<tr>";
		//add .lists collapse box
		table += "<td class='top'>Title</td>";
		table += "<td class='top'>Due</td>";
		table += "<td class='top'>Priority</td>";
		table += "<td class='top'>Hours</td>";

		for(var x = 0; x < this.boardData[i].lists[y].items.length; x++)
		{
			table += "<td>" + this.boardData[i].lists[y].items[x].title + "</td>";
			table += "<td>" + this.boardData[i].lists[y].items[x].due + "</td>";
			table += "<td>" + this.boardData[i].lists[y].items[x].priority + "</td>";
			table += "<td>" + this.boardData[i].lists[y].items[x].hours + "</td>";
			//add .items data into TD
		}
		table += "</tr>";
		
	}
	table += "</table>";
	$(.body).html = table;
}


function getBoards() {
    return Promise.all([
            t.get('member', 'private', 'user_token'),
            t.organization('id')
        ])
        .spread(function(user_token, organization) {
            Trello.get(
                'organizations/' + organization.id + '/boards',
                {
                    key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
                    token: user_token,
                    filter: 'open',
                    fields: 'name,id'
                },
                function success(data, responseText, xhr) {
                    console.log('json data:', data)
                    this.boards = data;
                },
                function error() {}
            );
        });
}

