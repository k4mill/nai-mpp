class FileContentLoader {
    file;

    constructor(file) {
        this.file = file;
        this.attributes = [];
        this.fileContent = '';
    }
    
    async readFileContent() {
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.readAsText(this.file);
            reader.addEventListener('load', () => {
                this.fileContent = reader.result;
                this.readData();
                res();
            })

            reader.onerror = (e) => {
                rej(e);
            }
        })
    }

    readData() {
        const lines = this.fileContent.split("\n");

        lines.forEach((line, index) => {
            this.attributes.push(line.split("\t"));
            this.attributes[index].forEach((attr, innerIndex) => {
                this.attributes[index][innerIndex] = attr.trim().replaceAll(",", ".");
            })
        });
    }

    addAttribute(attr) {
        if(attr.length > this.attributes[0].length) return;
        if(attr.length < this.attributes[0].length) {
            for(let i = attr.length - 1; i < this.attributes[0].length - 1; i++)
                attr.splice(i, 0, 0);
        }
        this.attributes.push(attr);
    }
}