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
	var table = $('<table>').addClass(this.boardData[i].board + 'Table');
	var row = $('<th>').addClass('boardRow').text(this.boardData[i].board);

	$('body').append(table);
	table.append(row);
	// add .board collapse box
	for(var y = 0; y < this.boardData[i].lists.length; y++)
	{
		var innerRow =  $('<tr>');
		table.append(innerRow);
		//add .lists collapse box
		for(var x = 0; x < this.boardData[i].lists[y].items.length; x++)
		{
			var titleCell = $('<td>').text(this.boardData[i].lists[y].items[x].title);
			innerRow.append(titleCell);

			var dueCell = $('<td>').text(this.boardData[i].lists[y].items[x].due);
			innerRow.append(dueCell);

			var priorityCell = $('<td>').text(this.boardData[i].lists[y].items[x].priority);
			innerRow.append(priorityCell);

			var hoursCell = $('<td>').text(this.boardData[i].lists[y].items[x].hours);
			innerRow.append(hoursCell);
			//add .items data into TD
		}
		
	}
	console.log(table);
	document.write(table);
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
                     for(var i = 0; i < data.length; i++)
					{
						return Promise.all([
				            t.get('member', 'private', 'user_token'),
				            t.organization('id')
				        ])
				        .spread(function(user_token, organization) {
				            Trello.get(
				                'organizations/' + organization.id + '/boards' + board.id + '/lists',
				                {
				                    key: 'ad42f1ee6ea8f3fe9e31018b5f861536',
				                    token: user_token,
				                    filter: 'open',
				                    fields: 'name,id'
				                },
				                function success(data, responseText, xhr) {
				                    console.log('json data:', data)
				                },
				                function error() {}
				            );
				        });
					}
                },
                function error() {}
            );
        });
}

