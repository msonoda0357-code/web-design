class TailAgent extends Agent {

    segments;
    segLength;

    constructor() {
        super(); // Agent(親クラス)のコンストラクタを呼び出す
        this.segments = [];
        for (let i = 0; i < 10; i++) {
            this.segments.push(createVector(0, 0));
        }
        this.segLength = 20;
    }

    updateSegments() {
        this.dragSegment(0, this.position);
        for (let i = 1; i < this.segments.length; i++) {
            this.dragSegment(i, this.segments[i - 1]);
        }
    }
    
    dragSegment(i, prevPoint) {
        const p = this.segments[i];
        // p を prevPoint に追従させる。
        const dx = prevPoint.x - p.x; // xの差分
        const dy = prevPoint.y - p.y; // xの差分
        const t = atan2(dy, dx);
        p.x = prevPoint.x - cos(t) * this.segLength;
        p.y = prevPoint.y - sin(t) * this.segLength;
    }

    drawSegments() {
        for (const seg of this.segments) {
            point(seg.x, seg.y);
        }
    }

    update() {
        super.update(); // 親クラスのアップデートを呼んでいる
        this.updateSegments();
    }
   
    draw() {
        super.draw();
        this.drawSegments();
    }
}

class BlobAgent extends Agent {
    constructor() {
        super(); // Agent(親クラス)のコンストラクタを呼び出す
    }
}