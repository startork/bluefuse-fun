import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'snake-game';

  @ViewChild('snakeCage') snakeCage!: ElementRef;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.newKeyDirection = 'UP';
        break;
      case 'ArrowLeft':
        this.newKeyDirection = 'LEFT';
        break;
      case 'ArrowRight':
        this.newKeyDirection = 'RIGHT';
        break;
      case 'ArrowDown':
        this.newKeyDirection = 'DOWN';
        break;
    }
  }

  gameStarted = false;
  showLost = false;
  currentScore = 0;
  highScore = 0;

  snakeX = 0;
  snakeY = 0;

  snakeTailX = 0;
  snakeTailY = 0;

  foodX = 0;
  foodY = 0;

  snakeHeadDirection = 'RIGHT';
  snakeTailDirection = 'RIGHT';

  snakeEaten = false;

  snakeCorners: any[] = [];

  newKeyDirection: string | null = null;

  interval: any = null;

  tickSpeed = 250;
  levels = [
    {
      key: 'easy',
      speed: 250,
    },
    {
      key: 'medium',
      speed: 220,
    },
    {
      key: 'difficult',
      speed: 180,
    },
    {
      key: 'tricky',
      speed: 90,
    },
    {
      key: 'impossible',
      speed: 25,
    },
  ];

  startGame() {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
    }
    this.gameStarted = true;
    this.runGame();
  }

  private initiateSnake() {
    this.currentScore = 0;

    this.snakeX = 45;
    this.snakeY = 25;

    this.snakeTailX = 25;
    this.snakeTailY = 25;

    this.foodX = 125;
    this.foodY = 125;

    this.snakeHeadDirection = 'RIGHT';
    this.snakeTailDirection = 'RIGHT';

    this.snakeCorners = [];

    this.snakeEaten = false;
  }

  private runGame() {
    this.initiateSnake();
    const snakeCage = this.snakeCage.nativeElement.getContext('2d');
    snakeCage.lineWidth = 10;

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      if (this.gameStarted) {
        this.checkKeyPress();

        this.moveSnake(snakeCage);
      }
    }, +this.tickSpeed);
  }

  private checkKeyPress() {
    if (!this.newKeyDirection) {
      return;
    }

    if (
      (this.snakeHeadDirection === 'UP' && this.newKeyDirection === 'DOWN') ||
      (this.snakeHeadDirection === 'DOWN' && this.newKeyDirection === 'UP') ||
      (this.snakeHeadDirection === 'RIGHT' &&
        this.newKeyDirection === 'LEFT') ||
      (this.snakeHeadDirection === 'LEFT' && this.newKeyDirection === 'RIGHT')
    ){
      this.newKeyDirection = null;
      // this.fail();
    } else {
        this.snakeHeadDirection = this.newKeyDirection;
        this.newKeyDirection = null;
        this.snakeCorners.push([this.snakeX, this.snakeY, this.snakeHeadDirection]);
      }
  }

  private moveSnake(cage: any) {
    // move head
    const [headX, headY] = this.directSnake(
      this.snakeX,
      this.snakeY,
      this.snakeHeadDirection
    );
    this.snakeX = headX;
    this.snakeY = headY;

    if (this.snakeX < 0 || this.snakeX > 700 || this.snakeY < 0 || this.snakeY > 500) {
      this.fail();
    }

    if (this.snakeX == this.foodX && this.snakeY === this.foodY) {
      this.foodX = Math.floor(Math.random() * 69) * 10 + 5;
      this.foodY = Math.floor(Math.random() * 49) * 10 + 5;
      this.lengthenSnake();
      this.currentScore += 1;
    }

    // sort out corners
    const cornerIndex = this.snakeCorners.findIndex(
      (corner) => corner[0] === this.snakeTailX && corner[1] === this.snakeTailY
    );
    if (cornerIndex > -1) {
      this.snakeTailDirection = this.snakeCorners[cornerIndex][2];
      this.snakeCorners.splice(cornerIndex, 1);
    }

    // move tail
    const [tailX, tailY] = this.directSnake(
      this.snakeTailX,
      this.snakeTailY,
      this.snakeTailDirection
    );
    this.snakeTailX = tailX;
    this.snakeTailY = tailY;

    this.checkCollision();

    cage.clearRect(0, 0, 700, 500);

    this.addFood(cage);

    // draw head
    cage.beginPath();
    cage.moveTo(this.snakeX, this.snakeY);

    // draw line to corner
    for (let index = this.snakeCorners.length - 1; index > -1; index--) {
      const corner = this.snakeCorners[index];
      cage.lineTo(corner[0], corner[1]);
    }

    // draw line to tail
    cage.lineTo(this.snakeTailX, this.snakeTailY);

    cage.stroke();
  }

  private directSnake(x: number, y: number, direction: string): number[] {
    switch (direction) {
      case 'UP':
        return [x, y - 10];
      case 'LEFT':
        return [x - 10, y];
      case 'RIGHT':
        return [x + 10, y];
      default:
        return [x, y + 10];
    }
  }

  private addFood(cage: any) {
    cage.beginPath();
    cage.fillStyle = "#92B901";
    cage.moveTo(this.foodX-5, this.foodY-5);
    cage.lineTo(this.foodX+5, this.foodY-5);
    cage.lineTo(this.foodX+5, this.foodY+5);
    cage.lineTo(this.foodX-5, this.foodY+5);
    cage.fill();
  }

  private fail() {
    this.gameStarted = false;
    this.showLost = true;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
    }

    clearInterval(this.interval);
    setTimeout(() => {
      this.showLost = false;
    }, 2000);
  }

  private lengthenSnake() {
    switch (this.snakeTailDirection) {
      case 'UP':
        this.snakeTailY += 10;
        break;
      case 'DOWN':
        this.snakeTailY -= 10;
        break;
      case 'RIGHT':
        this.snakeTailX -= 10;
        break;
      case 'LEFT':
        this.snakeTailX += 10;
        break;
    }
  }

  private checkCollision() {
    if (!this.snakeCorners.length) {
      return;
    }

    let currentX = this.snakeCorners[this.snakeCorners.length - 1][0];
    let currentY = this.snakeCorners[this.snakeCorners.length - 1][1];

    // draw line to corner
    for (let index = this.snakeCorners.length - 2; index > -1; index--) {
      let nextX = this.snakeCorners[index][0];
      let nextY = this.snakeCorners[index][1];

      if (nextX === currentX && currentX === this.snakeX && ((
        currentY <= this.snakeY && this.snakeY <= nextY
      ) || (
        nextY <= this.snakeY && this.snakeY <= currentY
      ))) {
        this.fail();
      }

      if (nextY === currentY && currentY === this.snakeY && ((
        currentX <= this.snakeX && this.snakeX <= nextX
      ) || (
        nextX <= this.snakeX && this.snakeX <= currentX
      ))) {
        this.fail();
      }

      currentX = nextX;
      currentY = nextY;
    }
  }
}
