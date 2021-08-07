/**
 *
 * Reldens - Users Client Package.
 *
 */

const { Logger, sc } = require('@reldens/utils');
const { LifebarUi } = require('./lifebar-ui');
const { PlayerStatsUi } = require('./player-stats-ui');
const { GameConst } = require('../../game/constants');

class UsersPack
{

    setupPack(props)
    {
        this.gameManager = sc.getDef(props, 'gameManager', false);
        if(!this.gameManager){
            Logger.error('Game Manager undefined in InventoryPack.');
        }
        this.events = sc.getDef(props, 'events', false);
        if(!this.events){
            Logger.error('EventsManager undefined in InventoryPack.');
        }
        this.initialGameData = {};
        this.events.on('reldens.beforeCreateEngine', (initialGameData, gameManager) => {
            this.initialGameData = initialGameData;
            this.onBeforeCreateEngine(initialGameData, gameManager);
            if(!this.lifeBarUi){
                this.lifeBarUi = new LifebarUi({events: this.events});
                this.lifeBarUi.setup(gameManager);
            }
        });
        this.playerStatsUi = new PlayerStatsUi({events: this.events});
        this.playerStatsUi.setup();
    }

    onBeforeCreateEngine(initialGameData, gameManager)
    {
        let isMultiplayerEnabled = sc.isTrue(initialGameData.gameConfig.client.players.multiplePlayers, 'enabled');
        let playerSelection = gameManager.gameDom.getElement('#player-selection');
        let playersCount = sc.isTrue(initialGameData, 'players') ? Object.keys(initialGameData.players).length : 0;
        if(
            // if multiplayer is disabled and the user already has a player then just allow the engine to be executed:
            (playersCount <= 1 && !isMultiplayerEnabled)
            // or if the container for the player selection/creation doesn't exists also allow the normal execution:
            || !playerSelection
        ){
            // before return set the only player available:
            initialGameData.player = initialGameData.players[0];
            return;
        }
        // for every other case we will stop the normal execution of the engine and show the selection/creation block:
        gameManager.canInitEngine = false;
        playerSelection.classList.remove('hidden');
        // if multiplayer is enabled and the user already has a player then setup the selector form:
        if(isMultiplayerEnabled && playersCount){
            this.preparePlayerSelector(playerSelection, initialGameData, gameManager);
        }
        this.preparePlayerCreator(playerSelection, initialGameData, gameManager);
    }

    preparePlayerSelector(playerSelection, initialGameData, gameManager)
    {
        let form = gameManager.gameDom.getElement('#player_selector_form');
        let select = gameManager.gameDom.getElement('#player-select-element');
        if(!form || !select){
            return false;
        }
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let selectedOption = select.options[select.selectedIndex].value;
            let selectedPlayer = this.getPlayerById(initialGameData.players, Number(selectedOption));
            if(selectedPlayer){
                playerSelection.classList.add('hidden');
                gameManager.initialGameData.player = selectedPlayer;
                gameManager.events.emitSync('reldens.onPreparePlayerSelectorFormSubmit',
                    this,
                    form,
                    select,
                    selectedPlayer,
                    gameManager
                );
                gameManager.initEngine().catch((err) => {
                    Logger.error(err);
                });
            }
            return false;
        });
        for(let i of Object.keys(initialGameData.players)){
            let player = initialGameData.players[i];
            let optionLabel = player.name+(player.additionalLabel || '');
            let option = new Option(optionLabel, player.id);
            option.dataset.key = player.avatarKey;
            select.append(option);
        }
        let avatarContainer = gameManager.gameDom.getElement('.player_selection_additional_info');
        if(avatarContainer){
            let playersConfig = initialGameData.gameConfig.client.players;
            gameManager.features.featuresList.actions
                .appendAvatarOnSelector(select, avatarContainer, gameManager, playersConfig);
        }
        form.classList.remove('hidden');
    }

    preparePlayerCreator(playerSelection, initialGameData, gameManager)
    {
        let $formElement = gameManager.gameDom.getElement('#player_create_form');
        if(!$formElement){
            return;
        }
        $formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            let errorElement = gameManager.gameDom.getElement('#player_create_form .response-error');
            errorElement.classList.add('hidden');
            let formData = new FormData($formElement);
            let serializedForm = sc.serializeFormData(formData);
            if(serializedForm['new_player_name'].toString().length < 3){
                return false;
            }
            gameManager.submitedForm = true;
            gameManager.gameRoom.send({act: GameConst.CREATE_PLAYER, formData: serializedForm});
            return false;
        });
    }

    getPlayerById(players, playerId)
    {
        let result = false;
        for(let player of players){
            if(player.id === playerId){
                result = player;
                break;
            }
        }
        return result;
    }

}

module.exports.UsersPack = UsersPack;
