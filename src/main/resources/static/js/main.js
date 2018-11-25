function getIndex(list, id) {
    for (let i = 0; i < list.length; i++) {
        if (list[i].id == id) {
            return i;
        }
    }
    return -1;
}

let messageApi = Vue.resource('/message{/id}');

Vue.component("messages-form", {
    props: ['messages', 'messageAttr'],
    data(){
        return {
            text: "",
            id: ""
        }
    },
    watch: {
        messageAttr(newVal, oldVal){
            this.text = newVal.text
            this.id = newVal.id
        }
    },
    template: `<div>
    <input type="text" placeholder="Write text" v-model="text"/>
    <input type="button" value="Save" @click="save"/>
    </div>`
    ,
    methods: {
        save(){
            let message = {text: this.text}
            if (this.id) {
                messageApi.update({id: this.id}, message)
                    .then(result =>
                        result.json().then(data => {
                            let index = getIndex(this.messages, data.id);
                            this.messages.splice(index, 1, data);
                            this.text = '';
                            this.id = ''
                        }));
            } else {
                messageApi.save({}, message)
                    .then(result =>
                        result.json().then(data => {
                            this.messages.push(data)
                        }));
                this.text = '';
            }
        }
    }
});

Vue.component("messages-row", {
    props: ['message', 'editMethod','messages'],
    template: `<div>
<i>{{message.id}}</i>. {{message.text}}
<span style="position: absolute; right: 0">
<input type="button" value="Edit" @click="edit">
<input type="button" value="X" @click="del">
</span>
</div>`
    ,
    methods: {
        edit(){
            this.editMethod(this.message)
        },
        del(){
            messageApi.remove({id: this.message.id})
                .then(result =>{
                    if(result.ok){
                        this.messages.splice(this.messages.indexOf(this.message),1)
                    }
                })
        }
    }
});

Vue.component("messages-list", {
    props: ['messages'],
    data(){
        return {
            message: null
        }
    },
    template: `<div style="position: relative; width: 300px">
<messages-form :messages="messages" :messageAttr="message" ></messages-form>
<messages-row v-for="message in messages" 
:key="message.id" :message="message" :messages="messages"
:editMethod="editMethod"></messages-row>
</div>`,
    created: function () {
        messageApi.get()
            .then(result =>
                result.json()
                    .then(data =>
                        data.forEach(message => this.messages.push(message))))
    },
    methods: {
        editMethod(message){
            this.message = message;
        }
    }
});

var app = new Vue({
    el: '#app',
    template: '<messages-list :messages="messages"/>',
    data: {
        messages: []
    }
});