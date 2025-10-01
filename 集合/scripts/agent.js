class Agent {

    position;
    velocity;

    maxspeed;
    maxforce;

    desiredSeparation;
    desiredAlignRadius;
    desiredCohesionRadius;

    color;
    t;
    segments;
    segLength;

    constructor() {
        this.position = createVector(
            random(0, width), random(0, height)
        );
        this.velocity = createVector(
            random(-1, 1), random(-1, 1)
        );
        this.maxspeed = 2.5;
        this.maxforce = 0.3;

        //円の大きさ
        this.desiredSeparation = 35;
        //距離感
        this.desiredAlignRadius = 10;
        //吸い込み力
        this.desiredCohesionRadius = 10;

        this.color = color(random(255), random(160,170), 230);
        this.t = 0;

        //追尾
        this.segments = [];
        for (let i = 0; i < 5; i++){
            this.segments.push(createVector(0, 0));
        }
        //追尾幅
        this.segLength = 5;

        this.drawLength = 250;
    }

    updateSegments(){
        this.dragSegments(0, this.position);
        for(let i = 1; i < this.segments.length; i++){
            this.dragSegments(i, this.segments[i - 1]);
        }
    }

    dragSegments(i, prevPoint){
        const p = this.segments[i];
        const dx = prevPoint.x - p.x;
        const dy = prevPoint.y - p.y;
        const t = atan2(dy, dx);
        p.x = prevPoint.x - cos(t) * this.segLength;
        p.y = prevPoint.y - sin(t) * this.segLength;
    }
    
    update() {
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        this.wrapBound();
        this.updateSegments();

        this.t += this.velocity.mag();
    }

    attract(target, radius) {

        const distance = p5.Vector.dist(target, this.position);
        if (distance < radius) {

            const desiredVelocity = p5.Vector.sub(target, this.position);
            desiredVelocity.setMag(this.maxspeed);
            
            const steer = p5.Vector.sub(desiredVelocity, this.velocity); // 加速度
            steer.div(distance / radius);
            
            steer.limit(this.maxforce);
    
            this.velocity.add(steer);
        }

    }

    separate(agents) {
        let sum = createVector(0, 0);
        let count = 0;

        for (const agent of agents) {
            const distance = p5.Vector.dist(agent.position, this.position);
            if (distance < this.desiredSeparation && distance != 0) {
                const desiredVelocity = p5.Vector.sub(this.position, agent.position);
                const weight = distance / this.desiredSeparation;
                desiredVelocity.div(weight);
                
                sum.add(desiredVelocity);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            sum.setMag(this.maxspeed);

            const steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxforce);

            return steer;
        } else {
            return createVector(0, 0);
        }
    }
    
    align(agents) {
        let sum = createVector(0, 0);
        let count = 0;

        for (const agent of agents) {
            const distance = p5.Vector.dist(agent.position, this.position);
            if (distance < this.desiredAlignRadius && distance != 0) { 
                sum.add(agent.velocity);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count); 
            sum.setMag(this.maxspeed);

            const steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxforce);

            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    cohesion(agents) {
        let sum = createVector(0, 0);
        let count = 0;

        for (const agent of agents) {
            const distance = p5.Vector.dist(agent.position, this.position);
            if (distance < this.desiredCohesionRadius && distance != 0) { 
                sum.add(agent.position);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            const desiredVelocity = p5.Vector.sub(sum, this.position);
            desiredVelocity.setMag(this.maxspeed);

            const steer = p5.Vector.sub(desiredVelocity, this.velocity);
            steer.limit(this.maxforce);

            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    flock(agents) {
        const sep = this.separate(agents);
        const ali = this.align(agents);
        const coh = this.cohesion(agents);

        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);

        this.velocity.add(sep);
        this.velocity.add(ali);
        this.velocity.add(coh);
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        rotate(atan2(this.velocity.y, this.velocity.x));

        const blink = map(sin(this.t * 0.05), -1, 1 , 0, 10);
        noStroke();
        blendMode(ADD);
        fill(blink);
        circle(0, 0, 90);
        //circle(0, 0, 25);

        noFill();
        stroke(this.color);
        strokeWeight(1);
        //circle(0, 0, this.desiredSeparation);

        this.drawArrow();
        
        pop();

        strokeWeight(1.5);
        stroke(160);
        this.drawSegments();
    }

    drawSegments(){
        for(const seg of this.segments){
            point(seg.x, seg.y);
        }
    }

    drawArrow() {
        strokeWeight(0.7);
        line(this.drawLength, 0, 0, this.drawLength);
        line(this.drawLength, 0, 0, -this.drawLength);

        line(-this.drawLength, 0, 0, this.drawLength);
        line(-this.drawLength, 0, 0, -this.drawLength);
    }

    wrapBound() {

        if (this.position.x > width) {
            this.position.x -= width;
        } else if (this.position.x < 0) {
            this.position.x += width;
        }

        if (this.position.y > height) {
            this.position.y -= height;
        } else if (this.position.y < 0) {
            this.position.y += this.position.y + height;
        }

    }

    bounceBound() {
        const pos = this.position;
        const vel = this.velocity;
        const w = width;
        const h = height;
        const pad = 10.0;

        if (pos.x > w + pad) {
            pos.x = w + pad;
            vel.x *= -1;
        }
        if (pos.x < 0 - pad) {
            pos.x = 0 - pad;
            vel.x *= -1;
        }
        if (pos.y > h + pad) {
            pos.y = h + pad;
            vel.y *= -1;
        }
        if (pos.y < 0 - pad) {
            pos.y = 0 - pad;
            vel.y *= -1;
        }
    }

}