use fluxcraft_core::wrapper::DataFrameWrapper;
use fluxcraft_pipeline::pipeline::Pipeline;
use jni::JNIEnv;

use jni::objects::{JObject, JString};

use jni::sys::{jbyteArray, jchar, jclass, jlong, jobject};
use tokio::runtime::Runtime;

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_fluxcraft_lib_core_Pipeline_load(
    mut env: JNIEnv,
    _class: jclass,
    path: JString,
) -> jobject {
    let file_path: String = env.get_string(&path).unwrap().into();

    match Pipeline::load(&file_path) {
        Ok(pipeline) => {
            let boxed = Box::new(pipeline);
            // FIXME this is never freed
            let ptr = Box::into_raw(boxed) as jlong;

            let cls = env.find_class("org/fluxcraft/lib/core/Pipeline").unwrap();
            let obj = env.new_object(cls, "(J)V", &[ptr.into()]).unwrap();

            obj.into_raw()
        }

        Err(e) => throw_err(e.into(), &mut env),
    }
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_fluxcraft_lib_core_Pipeline_execute<'local>(
    mut env: JNIEnv<'local>,
    jthis: JObject<'local>,
) -> jbyteArray {
    return match native_execute(&mut env, jthis) {
        Ok(r) => r,
        Err(e) => throw_err(e, &mut env),
    };
}

fn native_execute<'local>(
    env: &mut JNIEnv<'local>,
    jthis: JObject<'local>,
) -> Result<*mut jni::sys::_jobject, Box<dyn std::error::Error>> {
    let native_handle = env.get_field(&jthis, "nativeHandle", "J")?.j()?;

    let pipeline = unsafe { &mut *(native_handle as *mut Pipeline) };

    let rt = Runtime::new()?;

    let data = rt.block_on(pipeline.execute())?;

    let boxed = Box::new(data);
    // FIXME this is never freed
    let ptr = Box::into_raw(boxed) as jlong;

    let cls = env.find_class("org/fluxcraft/lib/core/DataFrame").unwrap();
    let obj = env.new_object(cls, "(J)V", &[ptr.into()]).unwrap();

    return Ok(obj.into_raw());
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_fluxcraft_lib_core_DataFrame_toCsvBytes<'local>(
    mut env: JNIEnv<'local>,
    jthis: JObject<'local>,
    separator: jchar,
) -> jbyteArray {
    return match native_to_csv_bytes(&mut env, jthis, separator) {
        Ok(result) => result,
        Err(e) => throw_err(e, &mut env),
    };
}

fn native_to_csv_bytes<'local>(
    env: &mut JNIEnv<'local>,
    jthis: JObject<'local>,
    separator: jchar,
) -> Result<jobject, Box<dyn std::error::Error>> {
    let native_handle = env.get_field(&jthis, "nativeHandle", "J")?.j()?;
    let wrapper = unsafe { &mut *(native_handle as *mut DataFrameWrapper) };
    let bytes = wrapper.to_csv_bytes(separator as u8 as char)?;

    return Ok(env.byte_array_from_slice(&bytes)?.into_raw());
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_fluxcraft_lib_core_DataFrame_toArrow<'local>(
    mut env: JNIEnv<'local>,
    jthis: JObject<'local>,
) -> jbyteArray {
    return match native_to_to_arrow(&mut env, jthis) {
        Ok(result) => result,
        Err(e) => throw_err(e, &mut env),
    };
}

fn native_to_to_arrow<'local>(
    env: &mut JNIEnv<'local>,
    jthis: JObject<'local>,
) -> Result<jbyteArray, Box<dyn std::error::Error>> {
    let native_handle = env.get_field(&jthis, "nativeHandle", "J")?.j()?;
    let wrapper = unsafe { &mut *(native_handle as *mut DataFrameWrapper) };
    let bytes = wrapper.to_arrow_buffer();

    return Ok(env.byte_array_from_slice(&bytes)?.into_raw());
}

fn throw_err(e: Box<dyn std::error::Error>, env: &mut JNIEnv) -> jobject {
    let _ = env.throw_new("java/lang/RuntimeException", format!("{}", e));
    std::ptr::null_mut()
}
