// The Forgotten Dungeon - interactive adventure
// Variables keep track of the player's choices and items.

let game = {
  room: 'spawn',
  items: [],
  visited: ['spawn'],
  notes: [],
  seenBeast: false,
  beastAlive: true,
  barrelOpened: false,
  ending: '',
  endStory: ''
};

// Load the player's previous game if there is one.
let saved = localStorage.getItem('forgottenDungeonSave');
if (saved) {
  try {
    let oldGame = JSON.parse(saved);
    if (oldGame.room && Array.isArray(oldGame.items) && Array.isArray(oldGame.visited) && Array.isArray(oldGame.notes)) {
      game = oldGame;
    }
  } catch (error) {
    // Start a new game if the saved data doesn't work.
  }
}

const title = document.getElementById('scene-title');
const description = document.getElementById('scene-description');
const actions = document.getElementById('actions');
const message = document.getElementById('message');

function saveGame() {
  localStorage.setItem('forgottenDungeonSave', JSON.stringify(game));
}

function hasItem(item) {
  return game.items.includes(item);
}

function getItem(item, text) {
  if (!hasItem(item)) game.items.push(item);
  showRoom();
  message.textContent = text;
}

// Make a button for each choice in the current room.
function addButton(text, nextStep) {
  let button = document.createElement('button');
  button.textContent = text;
  button.onclick = nextStep;
  actions.appendChild(button);
}

function goTo(room) {
  if (room === 'dark' && !hasItem('Lantern')) {
    finish('death', 'Lost in the Dark', 'You enter the pitch-black room. Something hisses nearby. Before you can react, a monster attacks you. Without a light, you never had a chance.');
    return;
  }

  if (room === 'boss' && game.beastAlive) {
    game.seenBeast = true;
    if (!game.notes.includes('The huge sleeping beast might be the hooded man’s fluffy friend.')) {
      game.notes.push('The huge sleeping beast might be the hooded man’s fluffy friend.');
    }
  }

  game.room = room;
  if (!game.visited.includes(room)) game.visited.push(room);
  showRoom();
}

function finish(type, heading, story) {
  game.room = type;
  game.ending = heading;
  game.endStory = story;
  showRoom();
}

function showRoom() {
  let room = game.room;
  let heading = '';
  let story = '';

  actions.innerHTML = '';
  message.textContent = '';

  // Spawn room
  if (room === 'spawn') {
    heading = 'Spawn Room';
    story = 'You wake up in an unfamiliar stone chamber. Two doors stand in front of you: one marked Storage Room and the other Hallway. A hooded man waits quietly beside the wall.';
    addButton('Enter Storage Room', () => goTo('storage'));
    addButton('Enter Hallway', () => goTo('hallway'));
    addButton('Talk to Hooded Man', () => goTo('hooded'));
  }

  // Hooded man
  else if (room === 'hooded') {
    heading = 'The Hooded Man';
    story = 'The hooded man leans toward you and asks, “Have you seen my fluffy friend?”';
    addButton('Nope', () => goTo('spawn'));

    if (game.seenBeast && game.beastAlive) {
      addButton('I found your friend!', () => {
        description.textContent = '“YOU FOUND FLUFFY?!” he shouts. “Please, take me to my wonderful friend!” He is practically bouncing with excitement.';
        actions.innerHTML = '';
        addButton('Lead Him to the Boss Room', () => finish('secret', 'Secret Ending: Fluffy Reunited!', 'The hooded man races into the Boss Room and hugs the enormous beast. “FLUFFY!” The monster wakes up and happily nuzzles him. As thanks, the man grants you super awesome wizard powers and a butt-ton of golden loot. You win!'));
        addButton('Never mind', () => goTo('spawn'));
      });
    }
  }

  // Storage room
  else if (room === 'storage') {
    heading = 'Storage Room';
    story = 'This old storage room is covered in dust and looks ready to collapse. There is an old table, a barrel in the corner, and a wooden chest against the wall.';
    if (!hasItem('Rope')) {
      addButton('Pick Up Rope from Table', () => getItem('Rope', 'You take a sturdy piece of rope from the table.'));
    }
    if (!game.barrelOpened) {
      addButton('Open Barrel', () => {
        game.barrelOpened = true;
        getItem('Lantern', 'Inside the barrel you find an old lantern! You add it to your inventory.');
      });
    }
    addButton('Open Chest', () => finish('death', 'The Chest Was a Mimic!', 'The chest suddenly grows teeth and lunges at you. It was a mimic all along! You are swallowed before you can get away.'));
    addButton('Return to Spawn', () => goTo('spawn'));
  }

  // Hallway
  else if (room === 'hallway') {
    heading = 'Hallway';
    story = 'You enter a long stone hallway with three doors. One is to your left, another to your right, and a large door at the far end has a skull and crossbones painted on it.';
    addButton('Left Door — Dark Room', () => goTo('dark'));
    addButton('Right Door — Pit Room', () => goTo('pit'));
    addButton('Skull Door — Boss Room', () => goTo('boss'));
    addButton('Return to Spawn', () => goTo('spawn'));
  }

  // Dark room
  else if (room === 'dark') {
    heading = 'Dark Room';
    story = 'Your lantern illuminates only a small patch of floor. Something scurries away into the darkness and hisses. You can investigate three corners, but you have no idea what is hiding there.';
    if (!hasItem('Key')) {
      addButton('Investigate Corner 1', () => getItem('Key', 'You find a small old key on the floor and take it.'));
    }
    addButton('Investigate Corner 2', () => finish('death', 'Something in the Corner', 'As you approach the second corner, a hidden monster leaps out of the shadows and attacks. You do not survive.'));
    if (!hasItem('Sword')) {
      addButton('Investigate Corner 3', () => getItem('Sword', 'You discover a sword leaning against the wall and take it.'));
    }
    addButton('Return to Hallway', () => goTo('hallway'));
  }

  // Pit room
  else if (room === 'pit') {
    heading = 'Pit Room';
    story = 'A giant pit filled with sharp spikes and writhing snakes divides the room. Across the gap, sunlight pours through an open doorway. A vine hangs from above.';
    addButton('Attempt to Jump', () => finish('death', 'A Terrible Fall', 'You leap toward the sunlight, but the pit is far too wide. You fall into the spikes below, where the snakes are waiting, resulting in a gruesome death.'));
    addButton('Swing on Vine', () => finish('death', 'The Vine Snaps', 'You grab the vine and swing over the pit. Halfway across, it snaps. You plummet into the spikes and snakes below, resulting in a gruesome death.'));
    if (hasItem('Rope')) {
      addButton('Use Rope to Swing Across', () => finish('victory', 'Victory: The Sunlit Escape', 'You securely tie your rope to a stone pillar, swing across the pit, and run through the sunny doorway. You escaped the dungeon!'));
    }
    addButton('Return to Hallway', () => goTo('hallway'));
  }

  // Boss room
  else if (room === 'boss') {
    heading = 'Boss Room';
    if (game.beastAlive) {
      story = 'A gigantic beast sleeps in the middle of the chamber. A sparkling chest rests beside it, and a door stands on the other side of the room. The creature is breathing slowly. You can still turn back.';
      addButton('Sneak to the Door', () => finish('death', 'The Beast Awakes', 'You tiptoe toward the exit, but the sleeping beast hears you. It wakes up and attacks before you can reach the door.'));
      if (hasItem('Sword')) {
        addButton('Stab the Sleeping Beast', () => {
          game.beastAlive = false;
          game.notes.push('You defeated the sleeping beast.');
          showRoom();
          message.textContent = 'You approach quietly and strike with your sword. The beast is defeated. The room is now safe to cross.';
        });
      }
    } else {
      story = 'The giant beast lies defeated. The exit door is now easy to reach. The sparkling chest still sits beside it, tempting you to take a look.';
      addButton('Exit Dungeon', () => finish('victory', 'Victory: The Boss Escape', 'With the beast defeated, you walk through the exit door. Fresh air and sunlight greet you. You escaped the dungeon!'));
      if (hasItem('Key')) {
        addButton('Unlock the Sparkling Chest', () => finish('death', 'Another Mimic!', 'The key turns in the lock. Suddenly, the chest opens its huge jaws! It is another mimic, and it attacks you before you can escape.'));
      }
    }
    addButton('Return to Hallway', () => goTo('hallway'));
  }

  // Endings
  else {
    heading = game.ending;
    story = game.endStory;
    addButton('Play Again', restart);
  }

  title.textContent = heading;
  description.textContent = story;
  let picture = room === 'hooded' ? 'spawn' : room;
  document.getElementById('scene-art').src = 'images/' + picture + '.svg';
  document.getElementById('scene-art').alt = heading + ' illustration';

  let label = room === 'hooded' ? 'Spawn Room · Hooded Man' : heading;
  if (room === 'death') label = 'Game Over';
  if (room === 'victory' || room === 'secret') label = 'Victory';
  document.getElementById('scene-label').textContent = label;

  let inventory = document.getElementById('inventory-list');
  inventory.innerHTML = '';
  let items = game.items.length ? game.items : ['Empty'];
  for (let item of items) {
    let li = document.createElement('li');
    li.textContent = item;
    inventory.appendChild(li);
  }

  let journal = document.getElementById('journal-list');
  journal.innerHTML = '';
  let notes = game.notes.length ? game.notes : ['Find a way out of the dungeon.'];
  for (let note of notes) {
    let li = document.createElement('li');
    li.textContent = note;
    journal.appendChild(li);
  }

  document.getElementById('progress').textContent = game.visited.filter(room => room !== 'hooded').length + ' of 6 rooms visited';
  saveGame();
}

function restart() {
  localStorage.removeItem('forgottenDungeonSave');
  location.reload();
}

document.getElementById('restart').onclick = restart;
showRoom();
