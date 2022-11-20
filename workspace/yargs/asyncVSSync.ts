/*******************************************
 * 同期関数と非同期関数の処理順序を
 * 場合別に実験することで
 * 処理のされ方の違いを理解する
 * 
 * 
 * *****************************************/ 

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function#%E9%9D%9E%E5%90%8C%E6%9C%9F%E9%96%A2%E6%95%B0%E3%81%A8%E5%AE%9F%E8%A1%8C%E9%A0%86
{
    function resolveAfter2Seconds() {
        console.log("starting slow promise")
        return new Promise(resolve => {
          setTimeout(function() {
            resolve("slow")
            console.log("slow promise is done")
          }, 2000)
        })
      }
      
      function resolveAfter1Second() {
        console.log("starting fast promise")
        return new Promise(resolve => {
          setTimeout(function() {
            resolve("fast")
            console.log("fast promise is done")
          }, 1000)
        })
      }
      
      async function sequentialStart() {
        console.log('==SEQUENTIAL START==')
      
        // 1. これは即時実行される
        const slow = await resolveAfter2Seconds()
        console.log(slow) // 2. これは 1. の 2 秒後に実行される
      
        const fast = await resolveAfter1Second()
        console.log(fast) // 3. これは 1. の 3 秒後に実行される
      }
      
      async function concurrentStart() {
        console.log('==CONCURRENT START with await==');
        const slow = resolveAfter2Seconds() // ただちにタイマーを起動
        const fast = resolveAfter1Second() // ただちにタイマーを起動
      
        // 1. これは即時実行される
        console.log(await slow) // 2. これは 1. の 2 秒後に実行される
        console.log(await fast) // 3. fast はすでに解決しているので、これは 1. の 2 秒後 (2.の直後) に実行される
      }
      
      function concurrentPromise() {
        console.log('==CONCURRENT START with Promise.all==')
        return Promise.all([resolveAfter2Seconds(), resolveAfter1Second()]).then((messages) => {
          console.log(messages[0]) // slow
          console.log(messages[1]) // fast
        })
      }
      
      async function parallel() {
        console.log('==PARALLEL with await Promise.all==')
      
        // 2 つの jobs を並列に実行し両方が完了するのを待つ
        await Promise.all([
            (async()=>console.log(await resolveAfter2Seconds()))(),
            (async()=>console.log(await resolveAfter1Second()))()
        ])
      }
      
      sequentialStart() // 2 秒後に "slow" をログ出力し、その 1 秒後に "fast" をログ出力する
      
      // 直前の処理を待つ
      setTimeout(concurrentStart, 4000) // 2 秒後に "slow" と "fast" をログ出力する
      
      // 直前の処理を待つ
      setTimeout(concurrentPromise, 7000) // concurrentStart と同様
      
      // 直前の処理を待つ
      setTimeout(parallel, 10000) // 本当に並列処理となるため 1 秒後に "fast" とログ出力し、その 1 秒後に "slow" とログ出力する
      
}