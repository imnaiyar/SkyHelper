export enum ScrambledResponseCodes {
  NotInitialized = 0,
  GameStart = 1,
  RoundStart = 2,
  CorrectRoundGuess = 3,
  WrongRoundGuess = 4,
  RoundTimeUp = 5,
  EndGame = 6,
}

export function getScrambledResponse(code: ScrambledResponseCodes, ...args: any[]): string {
  switch (code) {
    case ScrambledResponseCodes.NotInitialized:
      return "Game not initialized properly!";
    case ScrambledResponseCodes.GameStart:
      return `Welcome to Scrambled Rounds! This game will have **${args[0]}** rounds. The player with the most correct guesses wins!`;
    case ScrambledResponseCodes.RoundStart:
      return `**Round ${args[0]}/${args[1]}**\nYour word to unscramble is: **${args[2]}**`;
    case ScrambledResponseCodes.CorrectRoundGuess:
      return `<@${args[0]}> correctly unscrambled the word: **${args[1]}**!`;
    case ScrambledResponseCodes.WrongRoundGuess:
      return `<@${args[0]}> guessed "${args[1]}" - not correct!`;
    case ScrambledResponseCodes.RoundTimeUp:
      return `Time's up! The correct word was: **${args[0]}**`;
    case ScrambledResponseCodes.EndGame:
      return "The game has been stopped by the initiator.";
    default:
      return "Unknown response code";
  }
}
