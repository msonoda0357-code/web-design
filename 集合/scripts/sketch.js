let agents = [];
let subdiv;
let t;

setup = () => {
    const canvas = createCanvas(600, 600);
    canvas.parent("#container");
    canvas.id("p5");
    textSize(32);

    //個数
    for (let i = 0; i < 10; i++) {
        agents.push(new Agent());
    }

    subdiv = new Subdiv();
}

draw = () => {
    noFill();
    
    blendMode(BLEND);
    background(0);
    
    blendMode(SCREEN);
    //fill(64);

    let mousePos = createVector(mouseX, mouseY);
    const radius = 200;

    for (const agent of agents) {
        for (const t of touches) {
            agent.attract(createVector(t.x, t.y), radius);
        }
        if (mouseIsPressed) {
            agent.attract(mousePos, radius);
        }

        agent.flock(agents);
        agent.update();
        agent.draw();
    }

    subdiv.compute(agents);

    t += 0.05;
    
    stroke(random(255), random(110,160), random(190,220));
    strokeWeight(2);
    subdiv.drawDelauney();
    
    // stroke(255, 255, 255, 95);
    // strokeWeight(0.8);
    // subdiv.drawVoronoi();

    // noFill();
    // circle(mouseX, mouseY, radius * 2);

    // stroke(255, 120, 130);
    //strokeWeight(0.5);
    
    // drawConnectorByDist(100);
    // stroke(255, 120, 130);
    // drawConnectorByRNG();

}

const drawConnectorByDist = (dist) => {
    for(let i = 0; i < agents.length; i++){

        const a0 = agents[i];

        for(let j = 0; j < agents.length; j++){
            const a1 = agents[j];

            const d = p5.Vector.dist(a0.position, a1.position);

            if (d < dist) {
                line(
                    a0.position.x, a0.position.y,
                    a1.position.x, a1.position.y,
                );
            }
        }
    }
}

const drawConnectorByRNG = () => {
    for(let i = 0; i < agents.length; i++){

        const a0 = agents[i];

        for(let j = 0; j < agents.length; j++){
            const a1 = agents[j];

            const d = p5.Vector.dist(a0.position, a1.position);

            const hasAgentInArea = agents.some((agent) => {
                return(
                d > p5.Vector.dist(a0.position, agent.position) &&
                d > p5.Vector.dist(a1.position, agent.position)
                )
            });

            if(!hasAgentInArea) {
                line(
                    a0.position.x, a0.position.y,
                    a1.position.x, a1.position.y
                    );
            }
        }
    }
}