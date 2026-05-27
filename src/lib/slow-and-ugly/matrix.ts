
class Matrix {
    data: Float32Array;

    constructor() {
        this.data = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    translate(dx: number, dy: number, dz: number) {

        /** Translation matrix:
         *  1  0  0  dx
         *  0  1  0  dy
         *  0  0  1  dz
         *  0  0  0  1
         */

        for (let i = 0; i < 4; i++)
            this.data[i] += this.data[i + 12] * dx
        for (let i = 4; i < 8; i++)
            this.data[i] += this.data[i + 8] * dy
        for (let i = 8; i < 12; i++)
            this.data[i] += this.data[i + 4] * dz
    }

    scale(sx: number, sy: number, sz: number) {

        /** Scaling matrix:
         *  sx 0  0  0
         *  0  sy 0  0
         *  0  0  sz 0
         *  0  0  0  1
         */

		for (let i = 0; i < 4; i++)
            this.data[i] *= sx
        for (let i = 4; i < 8; i++)
            this.data[i] *= sy
        for (let i = 8; i < 12; i++)
            this.data[i] *= sz
	}

    rotateX(radians: number) {

        /** X rotation matrix:
         *  1  0  0  0
         *  0  c -s  0
         *  0  s  c  0
         *  0  0  0  1
         */

		let c = Math.cos(radians);
		let s = Math.sin(radians);
    
        for (let i = 4; i < 8; i++) {
            let temp = this.data[i + 4] * c + this.data[i] * s
            this.data[i] = this.data[i] * c - this.data[i + 4] * s
            this.data[i + 4] = temp
        }
    }

    rotateY(radians: number) {

        /** Y rotation matrix:
         *  c  0  s  0
         *  0  1  0  0
         * -s  0  c  0
         *  0  0  0  1
         */

		let c = Math.cos(radians);
		let s = Math.sin(radians);
    
        for (let i = 0; i < 4; i++) {
            let temp = this.data[i + 8] * c - this.data[i] * s
            this.data[i] = this.data[i] * c + this.data[i + 8] * s
            this.data[i + 8] = temp
        }
    }

    rotateZ(radians: number) {

        /** Z rotation matrix:
         *  c -s  0  0
         *  s  c  0  0
         *  0  0  1  0
         *  0  0  0  1
         */

		let c = Math.cos(radians);
		let s = Math.sin(radians);
    
        for (let i = 0; i < 4; i++) {
            let temp = this.data[i + 4] * c + this.data[i] * s
            this.data[i] = this.data[i] * c - this.data[i + 4] * s
            this.data[i + 4] = temp
        }
    }

    perspective(fov: number, aspect: number, near: number, far: number) {
        const a = 1.0 / Math.tan(fov / 2)
	    const b = -1.0 / (far - near)

        const x = a / aspect
        const y = b * (near + far)
        const z = b * 2 * near * far

        for (let i = 0; i < 4; i++)
            this.data[i] *= x
        for (let i = 4; i < 8; i++)
            this.data[i] *= b
        for (let i = 8; i < 12; i++)
            this.data[i] = this.data[i] * y + this.data[i + 4] * z
        for (let i = 12; i < 16; i++)
            this.data[i] *= -1
    }
}