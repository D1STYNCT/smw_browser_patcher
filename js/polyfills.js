	
	String.prototype.padRight = function(n, pad){
		t = this;
		if(n > this.length)
			for(i = 0; i < n-this.length; i++)
				t += pad;
		return t;
	}
	