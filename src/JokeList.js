import React, { Component } from 'react'
import axios from "axios"
import uuid from "uuid/v4"
import './JokeList.css'
import Joke from './Joke'

class JokeList extends Component{
    
    static defaultProps = {
        numJokerToGet : 10,
    }

    constructor(props) {
        super(props)
    
        this.state = {
            jokes : JSON.parse(window.localStorage.getItem("jokes") || "[]")  ,
            loading : false,       
        }
        this.seenJokes = new Set(this.state.jokes.map(j => j.text))
        this.handleClick = this.handleClick.bind(this)
    }

     componentDidMount(){
        if(this.state.jokes.length === 0) this.getJokes()
    }

    async getJokes(){
        try{
            let jokes = []
            while(jokes.length < this.props.numJokerToGet){
                let res = await axios.get("https://icanhazdadjoke.com",{
                    headers: {Accept: "application/json"}
                })
                if(!this.seenJokes.has(res.data.joke)){
                    jokes.push({id: uuid(), text: res.data.joke, votes: 0})
                }else{
                    console.log("We found a duplicate")
                }
            }
            this.setState( oldstate => ({
                loading : false,
                jokes : [...oldstate.jokes, ...jokes]
            }),
            () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)) )
        }catch(e){
            alert(e)
            this.setState({loading:false})
        }
    }
    
    handleVote(id, change){
        this.setState(oldstate => ({
            jokes : oldstate.jokes.map(joke => 
                joke.id === id ? {...joke, votes: joke.votes + change} : joke
            )
        }),
        () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        )
    }

    handleClick(){
        //callback this.getJokes
        this.setState({loading: true}, this.getJokes)
    }


    render(){
        if (this.state.loading){
            return(
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokeList-title">Loading...</h1>
                </div>
            )
        }
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
        return(
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                        <span>Dad</span>Jokes
                    </h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
                    <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>
                </div>
                <div className="JokeList-jokes">
                    {jokes.map( joke => (
                        <Joke 
                            key={joke.id} 
                            text={joke.text} 
                            votes={joke.votes} 
                            upvote={()=> this.handleVote(joke.id, 1)} 
                            downvote={()=> this.handleVote(joke.id, -1)} 
                        />
                    ))}
                </div>
            </div>
        )
    }
}

export default JokeList