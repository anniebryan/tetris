# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2024-02-08
### Added
- Display a button to start the game (rather than immediately starting)
- Hard drop a piece with enter key
### Changed
- Preview 3 pieces instead of 1

## [0.2.0] - 2020-12-18
### Changed
- Gameplay now only allows a hold move if valid (player didn't just make a hold move) to prevent holding forever
- Created player property canHold

## [0.1.1] - 2020-11-03
### Added
- Now gameplay will show the user what the current block will look like when dropped
- Created functions drawDroppedLocation and calculateDroppedOffset

## [0.1.0] - 2020-06-08
### Changed
- Algorithm for generation of pieces follows the official [Tetris Random Generator](https://tetris.fandom.com/wiki/Random_Generator)

## [0.0.2] - 2020-06-07
### Added
- User keyboard input now includes capital "A" and "D" for rotating
- Added gameState variable - true when user is playing
- When the game ends, the pieces stop scrolling, the arrow keys stop controlling the pieces and the final score is displayed on a window
  - This window includes a "start over button" which resets statistics and the game

## [0.0.1] - 2020-06-04
### Added
- Simple interactive Tetris game that handles user keyboard input
  - Left and right arrows move the piece left and right
  - Up arrow holds the piece, user is able to hold infinitely
  - Down arrow drops the piece faster
  - "a" and "d" keys rotate the piece counter-clockwise and clockwise
- Variables that update and are displayed (score, number of rows cleared, type of clear - single/double/triple/tetris)
- When the game ends, the score is reset and automatically begins playing again
