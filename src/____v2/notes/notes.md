
# Owl 2.0

Exported values:

owl
    setup
        addTemplate
        addComponent
        addStyleSheet
        addTranslateFunction

    utils
        renderToString
    
    mount
    render
    Component
    browser
    hooks
      useState

```js

class App extends Component {
    ...
}

// or

function App(env, props) {
    return () => render(template, {...})
}


await mount(App, {target: document.body, position: "", env, props: ...})

```


Files:

- scheduler.ts
- core
- fiber
- vdom
- qweb
- types