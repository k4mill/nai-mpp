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
        this.attributes.push(attr);
    }
}