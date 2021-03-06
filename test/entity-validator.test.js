/* Copyright (c) 2014 Richard Rodger */
"use strict";

// mocha entity-validator.test.js


var assert  = require('assert')

var _       = require('underscore')

var seneca  = require('seneca')






describe('entity-validator', function() {
  
  it('happy', function(fin) {
    var si = seneca()
    si.use('..')

    si.act('role:entity-validator,cmd:add',{
      entity:{name:'foo'},
      rules:{a:1,b:2}
    })

    //console.log(si.actroutes())

    var fooent = si.make$('foo')

    fooent.make$({a:1,b:2}).save$(function(err,out){
      if(err) return fin(err);

      assert.equal(1,out.a)
      assert.equal(2,out.b)

      fooent.make$({a:2,b:2}).save$(function(err,out){
        assert.equal(err.seneca.code,'entity-invalid')
        assert.equal(err.seneca.valmap.code,'eq$')
        assert.equal(err.seneca.valmap.property,'a')
        assert.equal(err.seneca.valmap.value,2)
        assert.equal(err.seneca.valmap.expected,1)

        fin()
      })
    })
  })


  it('options', function(fin) {
    var si = seneca()
    si.use('..',{ruleset:[
      {entity:'foo',rules:{a:1}},
      {entity:'bar',rules:{b:2}},
    ]})


    var fooent = si.make$('foo')
    var barent = si.make$('bar')

    fooent.make$({a:1}).save$(function(err,out){
      if(err) return fin(err);

      assert.equal(1,out.a)

      barent.make$({b:2}).save$(function(err,out){
        if(err) return fin(err);

        assert.equal(2,out.b)

        fooent.make$({a:2}).save$(function(err,out){
          assert.equal(err.seneca.code,'entity-invalid')
          assert.equal(err.seneca.valmap.code,'eq$')
          assert.equal(err.seneca.valmap.property,'a')
          assert.equal(err.seneca.valmap.value,2)
          assert.equal(err.seneca.valmap.expected,1)

          barent.make$({b:1}).save$(function(err,out){
            assert.equal(err.seneca.code,'entity-invalid')
            assert.equal(err.seneca.valmap.code,'eq$')
            assert.equal(err.seneca.valmap.property,'b')
            assert.equal(err.seneca.valmap.value,1)
            assert.equal(err.seneca.valmap.expected,2)

            fin()
          })
        })
      })
    })
  })


  it('code', function(fin) {
    var si = seneca()
    si.use('..',{
      ruleset:[
        {entity:'foo',rules:{a:{startsWith$:'AAA'}}},
        {entity:'zoo/bar',rules:{b:2}},
      ],
      prefs:{
        rules:{
          startsWith$: function(ctxt,cb){
            if( 0 === (''+ctxt.point).indexOf(''+ctxt.rule.spec) ) return cb();
            ctxt.util.fail(ctxt,cb)
          }
        }
      }
    })


    var fooent = si.make$('foo')

    fooent.make$({a:'AAAzed'}).save$(function(err,out){
      if(err) return fin(err);

      fooent.make$({a:'zed'}).save$(function(err,out){
        assert.ok(err)

        si.act('role:entity-validator,cmd:generate_code',function(err,js){
          if( err ) return fin(err);
          console.log(js)
          fin()
        })
      })
    })
  })


})
