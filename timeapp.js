const Trello = require('trello');

const Trello = require('trello');
const trello = new Trello('d3a85c83bfa6994a2c9d7fb7bd8b6966', '10e04b5ef8963672420c40a60ec21ceeaf448c67203b12e2e6b772a4daed31e2');

trello.get(`/1/boards/${boardId}`, (err, board) => {
  if (err) {
    console.error(err);
    return;
  }

  const cards = board.cards;

  const timerButton = {
    text: 'Start Timer',
    callback: function (t) {
      const startTime = Date.now();
      t.set('card', 'shared', 'startTime', startTime);
      t.set('card', 'shared', 'timerRunning', true);
      t.set('card', 'button', 'Stop Timer', 'Stop Timer', true);
    },
    condition: 'edit'
  };

  const stopTimerButton = {
    text: 'Stop Timer',
    callback: function (t) {
      const cardId = t.getContext().card;
      const pluginData = t.getContext().plugins['trello-time-tracking'];
      const startTime = pluginData.startTime;
      const totalTime = pluginData.totalTime;
      const elapsedTime = Date.now() - startTime;
      const newTotalTime = totalTime + elapsedTime;

      t.set('card', 'shared', 'totalTime', newTotalTime);
      t.set('card', 'shared', 'timerRunning', false);
      t.set('card', 'button', 'Start Timer', 'Start Timer', true);
      t.post(`/1/cards/${cardId}/actions/comments`, 
        { text: `Time Spent: ${newTotalTime}` });
      t.put(`/1/cards/${cardId}/pluginData`, {
        value: {
          startTime: null,
          totalTime: newTotalTime
        },
        key: 'trello-time-tracking'
      });
    },
    condition: 'edit'
  };

  cards.forEach(card => {
    trello.post(`/1/cards/${card.id}/actions/comments`, { text: 'Time Spent: 0' });
    trello.put(`/1/cards/${card.id}/pluginData`, {
      value: {
        startTime: null,
        totalTime: 0
      },
      key: 'trello-time-tracking'
    });
    trello.post(`/1/cards/${card.id}/buttons`, timerButton);
  });
});
