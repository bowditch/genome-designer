import React from 'react';
import { render as reactRender } from 'react-dom';

import {OnionForGenomeDesigner} from './extensions/onion2/OnionForGenomeDesigner';


class OnionViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: props.container.offsetWidth,
            height: props.container.offsetHeight,
        };
        //console.log(this.enzymeList);
    }

    componentWillMount() {
        const self = this;
        let lastBlock;

        this.setState({
            block: null,
            rendered: Date.now(),

        });

        const storeSubscriber = (store) => {
            const { currentBlocks } = store.ui;
            //console.log("--block",store.ui);
            const block = (Array.isArray(currentBlocks) && currentBlocks.length) ? store.blocks[currentBlocks[0]] : null;
            // all instances in the store are immutables, so you can just do a reference equality check to see if it has changed
            // this would also be a good place to convert to the onion format
            // it would be a great place to memoize
            // (i.e. return same value if input === previous input, rather than storing it explicitly in the component,
            // and then you can reuse the selector for all things you retrieve from the store)
            //if (!!block && block !== lastBlock) {
            //  //note that right now, blocks dont have a sequence... this will work but nothing will be returned
            //  block.getSequence()
            //    .then(sequence => {
            //      self.setState({
            //        blocks,
            //        sequence,
            //      });
            //    });
            //  lastBlock = block;
            //}

            if(Array.isArray(currentBlocks) && currentBlocks.length) {
                console.log("currentBlocks",currentBlocks);
                let readBlockCount = currentBlocks.length;
                let onionBlocks = [];
                let start = 0;
                let totalSequence = "";
                let readSequenceFromBlock = (i,count)=>{
                    let block = store.blocks[currentBlocks[i]];
                    block.getSequence().then(sequence=>{
                        if(sequence) {
                            onionBlocks.push({
                                color: block.metadata.color,
                                start: start,
                                length: sequence.length,
                                name: block.metadata.name,
                            });
                            start += sequence.length;
                            totalSequence += sequence;
                            if (i == count - 1) {
                                this.setState({blocks: onionBlocks, sequence: totalSequence});
                            }
                            else {
                                readSequenceFromBlock(i + 1, count);
                            }
                        }
                    });
                };
                readSequenceFromBlock(0,readBlockCount);
            }
            else{
                console.log("no block");
            }
        };





        this.subscriber = window.gd.store.subscribe(storeSubscriber);
        this.updateDimensions();
    }

    updateDimensions(setState=true){
        //let width = this.props.container.offsetWidth;
        //let height = this.props.container.offsetHeight;

		let frames = document.getElementsByClassName("ProjectDetail");
		console.log("frames",frames);
		let rectObject = frames[0].getBoundingClientRect();
		console.log("rectObject",rectObject);
		let width = rectObject.width - 20;
        let height = $(window).height() - rectObject.top - $(".ProjectDetail-heading").height()-8;
		console.log("rectObject",height);
        height = Math.max(1,height);
        console.log("new dimensions",width,height);
		if(setState)
        	this.setState({width: width,height:height});
		else{
			this.state.width=width;
			this.state.height=height;
		}
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        this.subscriber();
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    render() {
		let {sequence,features,width,height,blocks} = this.state;
		//let frames = document.getElementsByClassName("ProjectDetail");
		//let rectObject = frames[0].getBoundingClientRect();
		//width = rectObject.width - 20;
		//height= rectObject.height - $(".ProjectDetail-heading").height();
        return (
            <OnionForGenomeDesigner
                sequence={sequence}
                features={features}
                width={width}
                height={height}
                blocks={blocks}
            ></OnionForGenomeDesigner>
        )
    }
}

/* register with store */
//note that if you were using redux, you could wrap your component in a Provider, and pass in window.gd.store
//we'll just register directly for this example

/* rendering + registering extension */

const render = (container) => {
    container.className += " onionContainer";
    reactRender(<OnionViewer
        container={container}
    />, container);
};

const manifest = {
    id: 'onion-0.0.0',
    name: 'Sequence Detail',
    render,
};

window.gd.registerExtension('sequenceDetail', manifest);

//hack - hide Isaac's A at the bottom
const style = document.createElement('style');
style.appendChild(document.createTextNode('')); // WebKit hack :(
document.head.appendChild(style);
style.sheet.insertRule('#bp1 { position: absolute; left: -100px;}');
