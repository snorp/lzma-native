'use strict';

var assert = require('assert');

var lzma = require('../');

describe('lzma', function() {
	describe('#versionNumber', function() {
		it('should be present and of number type', function() {
			assert.ok(lzma.versionNumber());
			assert.equal(typeof lzma.versionNumber(), 'number');
		});
	});
	
	describe('#versionString', function() {
		it('should be present and of string type', function() {
			assert.ok(lzma.versionNumber());
			assert.equal(typeof lzma.versionString(), 'string');
		});
	});
	
	describe('#checkIsSupported', function() {
		it('should at least support no check and crc32', function() {
			assert.strictEqual(true, lzma.checkIsSupported(lzma.CHECK_NONE));
			assert.strictEqual(true, lzma.checkIsSupported(lzma.CHECK_CRC32));
		});
		it('should return false for non-existing checks', function() {
			// -1 would be thee bitwise or of all possible checks
			assert.strictEqual(false, lzma.checkIsSupported(-1));
		});
	});
	
	describe('#checkSize', function() {
		it('should be zero for CHECK_NONE', function() {
			assert.strictEqual(0, lzma.checkSize(lzma.CHECK_NONE));
		});
		
		it('should be non-zero for crc32', function() {
			assert.ok(lzma.checkSize(lzma.CHECK_CRC32) > 0);
		});
		
		it('should be monotonous', function() {
			assert.ok(lzma.checkSize(lzma.CHECK_CRC32 | lzma.CHECK_SHA256) >= lzma.checkSize(lzma.CHECK_CRC32));
		});
		
		it('should be strictly monotonous if SHA256 is supported', function() {
			assert.ok(lzma.checkSize(lzma.CHECK_CRC32 | lzma.CHECK_SHA256) > lzma.checkSize(lzma.CHECK_CRC32) ||
				!lzma.checkIsSupported(lzma.CHECK_SHA256));
		});
	});
	
	describe('#crc32', function() {
		it('should be the standard CRC32 value for a few strings', function() {
			assert.strictEqual(0x00000000, lzma.crc32(''));
			assert.strictEqual(0x414fa339, lzma.crc32('The quick brown fox jumps over the lazy dog'));
			assert.strictEqual(0x414fa339, lzma.crc32(new Buffer('The quick brown fox jumps over the lazy dog')));
			assert.strictEqual(0xafabd35e, lzma.crc32('crc32'));
		});
	});
	
	describe('#filterEncoderIsSupported', function() {
		it('should return true for LZMA1, LZMA2', function() {
			assert.strictEqual(true, lzma.filterEncoderIsSupported(lzma.FILTER_LZMA1));
			assert.strictEqual(true, lzma.filterEncoderIsSupported(lzma.FILTER_LZMA2));
		});
		
		it('should return false for VLI_UNKNOWN', function() {
			assert.strictEqual(false, lzma.filterEncoderIsSupported(lzma.VLI_UNKNOWN));
		});
	});
	
	describe('#filterDecoderIsSupported', function() {
		it('should return true for LZMA1, LZMA2', function() {
			assert.strictEqual(true, lzma.filterDecoderIsSupported(lzma.FILTER_LZMA1));
			assert.strictEqual(true, lzma.filterDecoderIsSupported(lzma.FILTER_LZMA2));
		});
		
		it('should return false for VLI_UNKNOWN', function() {
			assert.strictEqual(false, lzma.filterDecoderIsSupported(lzma.VLI_UNKNOWN));
		});
	});
	
	describe('#mfIsSupported', function() {
		it('should return true for MF_HC4', function() {
			assert.strictEqual(true, lzma.mfIsSupported(lzma.MF_HC4));
		});
		
		it('should return true for a wrong value', function() {
			assert.strictEqual(false, lzma.mfIsSupported(-1));
		});
	});
	
	describe('#modeIsSupported', function() {
		it('should return true for LZMA_MODE_FAST', function() {
			assert.strictEqual(true, lzma.modeIsSupported(lzma.MODE_FAST));
		});
		
		it('should return true for a wrong value', function() {
			assert.strictEqual(false, lzma.modeIsSupported(-1));
		});
	});
	
	describe('#rawEncoderMemusage', function() {
		it('should be positive for LZMA1, LZMA2', function() {
			assert.ok(lzma.rawEncoderMemusage([{id: lzma.FILTER_LZMA1}]) > 0);
			assert.ok(lzma.rawEncoderMemusage([{id: lzma.FILTER_LZMA2}]) > 0);
		});
		
		it('should return null for VLI_UNKNOWN', function() {
			assert.strictEqual(null, lzma.rawEncoderMemusage([{id: lzma.VLI_UNKNOWN}]));
		});
		
		it('should be monotonous in the preset parameter', function() {
			for (var i = 1; i < 9; ++i)
				assert.ok(lzma.rawEncoderMemusage([{id: lzma.FILTER_LZMA2, preset: i+1}])
					>= lzma.rawEncoderMemusage([{id: lzma.FILTER_LZMA2, preset: i}]));
		});
	});
	
	describe('#rawDecoderMemusage', function() {
		it('should be positive for LZMA1, LZMA2', function() {
			assert.ok(lzma.rawDecoderMemusage([{id: lzma.FILTER_LZMA1}]) > 0);
			assert.ok(lzma.rawDecoderMemusage([{id: lzma.FILTER_LZMA2}]) > 0);
		});
		
		it('should return null for VLI_UNKNOWN', function() {
			assert.strictEqual(null, lzma.rawDecoderMemusage([{id: lzma.VLI_UNKNOWN}]));
		});
		
		it('should be monotonous in the preset parameter', function() {
			for (var i = 1; i < 9; ++i)
				assert.ok(lzma.rawDecoderMemusage([{id: lzma.FILTER_LZMA2, preset: i+1}])
					>= lzma.rawDecoderMemusage([{id: lzma.FILTER_LZMA2, preset: i}]));
		});
	});
	
	describe('#easyEncoderMemusage', function() {
		if('should be positive', function() {
			assert.ok(lzma.easyEncoderMemusage(1) > 0);
		});
		
		it('should be monotonous in the preset parameter', function() {
			for (var i = 1; i < 9; ++i)
				assert.ok(lzma.easyEncoderMemusage(i+1) >= lzma.easyEncoderMemusage(i));
		});
	});
	
	describe('#easyDecoderMemusage', function() {
		if('should be positive', function() {
			assert.ok(lzma.easyDecoderMemusage(1) > 0);
		});
		
		it('should be monotonous in the preset parameter', function() {
			for (var i = 1; i < 9; ++i)
				assert.ok(lzma.easyDecoderMemusage(i+1) >= lzma.easyDecoderMemusage(i));
		});
	});
});
