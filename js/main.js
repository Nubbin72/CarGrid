
class Line {
	constructor(start_x, start_y, end_x, end_y) {
		this.start_x = start_x;
		this.start_y = start_y;
		this.end_x = end_x;
		this.end_y = end_y;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.start_x, this.start_y);
		ctx.lineTo(this.end_x, this.end_y);
		ctx.strokeStyle = "white";
		ctx.stroke();
	}
}

class Tile {
	constructor(image,x,y,w,h) {
		this.image = image;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	
	draw(ctx) {
		ctx.drawImage(this.image,this.x,this.y,this.w,this.h);
	}
}

// Grid class contains the environment of the simulation, it includes the background tiles and lines that are drawn on the screen
class Grid {
	// The constructor takes x and y values which are the dimensions of the grid, and tile_size which indicates the width and height of the square
	constructor(x,y, tile_size) {
		this.x = x;
		this.y = y;
		this.tile_size = tile_size;
		this.background = new Image();
		this.background.src = "img/background.jpg";

		this.lines = [];
		for (var i=0; i<this.x; i++) {
			this.lines.push(new Line(i*this.tile_size, 0, i*this.tile_size, this.y*this.tile_size));
		}
		for (var i=0; i<this.y; i++) {
			this.lines.push(new Line(0, i*this.tile_size, this.x*this.tile_size, i*this.tile_size));
		}
		
		this.tiles = [];
		for (var i=0; i<this.x; i++) {
			var row = [];
			for (var j=0; j<this.y; j++) {
				row.push(new Tile(this.background, i*this.tile_size, j*this.tile_size, this.tile_size, this.tile_size));
			}
			this.tiles.push(row);			 
		}
	}
	
	// Draw method draws the tiles and lines to the canvas
	draw(ctx) {
		for (var i=0; i<this.x; i++) {
			for (var j=0; j<this.y; j++) { 
				this.tiles[i][j].draw(ctx);
			}
		}
		
		for (var i=0; i<this.x+this.y; i++) {
			this.lines[i].draw(ctx);
		}
	}
}


class Car {
	// The constructor takes x and y for the starting position of the car, and the size which is the height and width of the car
	constructor(x,y,size) {
		this.position = {x:x, y:y};
		this.size = {w:size,h:size};
		this.direction = {x:1,y:0}; // Setting the initial movement direction
		this.speed = 30; 
		this.ready = true; // Indicates that the car is ready to select a new direction
		this.carImage = new Image();
		this.carImage.src = "img/car.png";
	}

	// After a valid turn was made, this function calculates the distance it needs to move the car each iteration
	setDistance(point) {
		this.point = point;
		this.distance_x = (this.position.x - this.point.x) / this.speed;
		this.distance_y = (this.position.y - this.point.y) / this.speed;
	}

	// Update method is in charge of moving the car to the selected position
	// The car is moved each tick untill it is at the correct position
	update() {
		if (this.position.x != this.point.x  || this.position.y != this.point.y) {
			this.position.x -= this.distance_x;
			this.position.y -= this.distance_y;
		} else {
			this.ready = true;
		}
	}

	// Function in charge of determining the turn direction based on the current movement
	turn(dir) {
		if (this.direction.x == 0 && this.direction.y == 1) { // going up
			if (dir == "left")
				this.direction.x = -1;
			else
				this.direction.x = 1;
			this.direction.y = 0;
		} else if (this.direction.x == 0 && this.direction.y == -1) { // going down
			if (dir == "left")
				this.direction.x = 1; 
			else
				this.direction.x = -1; 
			this.direction.y = 0;
		} else if (this.direction.x == -1 && this.direction.y == 0) { // going left
			this.direction.x = 0; 
			if (dir == "left")
				this.direction.y = -1;
			else
				this.direction.y = 1;
		} else if (this.direction.x == 1 && this.direction.y == 0) { // going right
			this.direction.x = 0;
			if (dir == "left")
				this.direction.y = 1;
			else
				this.direction.y = -1;
		}
	}

	draw(ctx) {
		// Determining the car's rotation based on the moving direction
		ctx.save(); 
		ctx.translate(this.position.x, this.position.y);
		ctx.translate(this.size.w/2, this.size.h/2);
		var rotation = null;
		if (this.direction.x == 1)
			rotation = 90;
		else if (this.direction.x == -1)
			rotation = -90;
		else if (this.direction.y == 1)
			rotation = 180;
		else
			rotation = 0;
		ctx.rotate(Math.PI / 180 * rotation);
		// Drawing the car image
		ctx.drawImage(this.carImage, -this.size.w/2, -this.size.h/2, this.size.w, this.size.h)
		ctx.restore();
	}

}

// Class that 
class Simulation {
	constructor(x,y,size) {
		this.grid_width = x;
		this.grid_height = y;
		this.tile_size = size;

		// Creating canvas element and properties
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = this.tile_size * this.grid_width;
		this.canvas.height = this.tile_size * this.grid_height;
		document.body.appendChild(this.canvas)

		// Storing the information about frame time needed for updating the main loop
		this.then = Date.now();
		this.fps = 120;
		this.frame_time = 1000/this.fps;

		// Defining the simulation objects
		this.grid = new Grid(this.grid_width, this.grid_height, this.tile_size);
		this.car = new Car(0,0,this.tile_size);

		// Start the main loop
		this.mainLoop();
	}


	update() {
		if (this.car.ready) { // Verify that the car is ready to make a turn, ie. it has reached the previus destination
			while (true) {
				// Decide car's direction
				// 0 = left
				// 1-2 = straight
				// 3 = right
				var random_direction = Math.floor(Math.random() * 4);
				switch (random_direction) {
					case 0:
						this.car.turn("left");
						break;
					case 3:
						this.car.turn("right");
						break;
				}
				
				// Calculate the point where the car would be if it goes to the selected direction
				var point = {x:this.car.position.x + (150 * this.car.direction.x), y:this.car.position.y + (150 * this.car.direction.y)}
				// If that point is within the grid break the loop, if it is outside of the grid, another random direction is choosen
				if ((point.x >= 0 && point.x < this.tile_size * this.grid_width) && (point.y >= 0 && point.y < this.tile_size * this.grid_height)) {
					break;
				}
			}
			// Once car's direction has been determined calculate the distance 
			// and note it is not ready to make another turn untill it reaches it's destination
			this.car.ready = false;
			this.car.setDistance(point);
		}

		this.car.update();
	}
	
	draw() {
		// Clearing the previously drawn elements
		this.ctx.clearRect(0,0, this.size*this.grid_width, this.size*this.grid_height);
		// Drawing all elements in the game
		this.grid.draw(this.ctx);
		this.car.draw(this.ctx);
	}

	// Main simulation loop
	mainLoop() {
		var now = Date.now();
		this.elapsed = now - this.then;
		// If enough time has passed since the last update, update and draw the elements again
		if (this.elapsed > this.frame_time) {
			this.update();
			this.draw();
			this.then = now;
		}
		requestAnimationFrame(function(){
			simulation.mainLoop();
		});	
	}
}

simulation = new Simulation(5,5,150);